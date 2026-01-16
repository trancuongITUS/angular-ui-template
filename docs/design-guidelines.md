# Design Guidelines

**Version:** 20.0.0
**Last Updated:** January 15, 2026

## Theme System Overview

The Sakai-ng template features a comprehensive theme customization engine providing 384+ unique theme combinations.

### Theme Dimensions

#### 1. Preset (3 Options)

**Light Mode**
- Bright backgrounds and light text
- Default for daytime use
- Better readability in bright environments

**Dark Mode**
- Dark backgrounds and light text
- Reduces eye strain in low light
- More modern aesthetic

**Auto Mode**
- Follows system preference
- Switches automatically at sunrise/sunset
- Best for user preference

#### 2. Colors (16 Palettes)

Primary color selection for buttons, links, accents:

```
┌─────────┬─────────┬────────┬─────────┐
│  Blue   │  Cyan   │ Green  │  Lime   │
├─────────┼─────────┼────────┼─────────┤
│ Purple  │  Red    │ Pink   │ Orange  │
├─────────┼─────────┼────────┼─────────┤
│ Yellow  │  Teal   │Indigo  │ Violet  │
├─────────┼─────────┼────────┼─────────┤
│ Amber   │  Rose   │  Sky   │ Custom  │
└─────────┴─────────┴────────┴─────────┘
```

**Recommended Uses:**
- **Blue** - Corporate, professional apps
- **Green** - Health, finance, growth-focused
- **Purple** - Creative, entertainment apps
- **Red** - Alert, warning, action-focused
- **Orange** - Energetic, startup vibes

#### 3. Surfaces (8 Levels)

Background color intensity affecting overall contrast:

```
Surface-0    → Lightest (almost white in light mode)
Surface-50   → Very light
Surface-100  → Light
Surface-200  → Medium-light
Surface-300  → Medium
Surface-400  → Medium-dark
Surface-500  → Dark
Surface-950  → Darkest (almost black in dark mode)
```

**Selection Guide:**
- **Lower levels (0-100)** - Higher contrast, more accessible
- **Medium levels (200-400)** - Balanced contrast
- **Higher levels (500-950)** - Lower contrast, subtle styling

## CSS Variables & Theming

### Available CSS Variables

```scss
// Primary Colors
--primary-50 through --primary-950
--primary-color: var(--primary-500)

// Accent Colors
--accent-50 through --accent-950

// Background & Surfaces
--surface-0: #ffffff (light) / #000000 (dark)
--surface-50 through --surface-950
--surface-background: Main content background
--surface-foreground: Cards, panels foreground
--surface-border: Border colors

// Text Colors
--text-color: Main text
--text-color-secondary: Secondary text
--text-color-tertiary: Tertiary text
--text-color-disabled: Disabled text

// State Colors
--success-color: #4CAF50
--warning-color: #FF9800
--danger-color: #F44336
--info-color: #2196F3

// Shadows
--shadow-1, --shadow-2, --shadow-3
--shadow-elevation-1, --shadow-elevation-2

// Spacing & Sizing
--border-radius: 6px
--transition-duration: 0.3s
```

### Using CSS Variables in Components

```scss
// Component styles
.product-card {
  background: var(--surface-foreground);
  color: var(--text-color);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-1);
  padding: var(--spacing-3);
  transition: all var(--transition-duration) ease;

  &:hover {
    background: var(--surface-50);
    box-shadow: var(--shadow-2);
  }

  .product-title {
    color: var(--text-color);
    font-weight: 600;
  }

  .product-price {
    color: var(--primary-color);
    font-size: 1.25rem;
  }

  .badge {
    background: var(--success-color);
    color: white;
  }
}
```

## Dark Mode Implementation

### Automatic Dark Mode Detection

```typescript
// LayoutService detects system preference
export class LayoutService {
  private darkMode = signal(false);

  constructor() {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.darkMode.set(prefersDark);

    // Listen for changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener(
      'change',
      e => this.darkMode.set(e.matches)
    );
  }

  toggleDarkMode(): void {
    this.darkMode.update(v => !v);
  }

  getDarkMode = () => this.darkMode;
}
```

### Applying Dark Mode Class

```typescript
// In app.component.ts
export class AppComponent implements OnInit {
  #layoutService = inject(LayoutService);

  ngOnInit(): void {
    effect(() => {
      const isDark = this.#layoutService.getDarkMode()();
      const html = document.documentElement;

      if (isDark) {
        html.classList.add('app-dark');
      } else {
        html.classList.remove('app-dark');
      }
    });
  }
}
```

## Component Styling Approach

### TailwindCSS + CSS Variables

Components use a hybrid approach:

```typescript
@Component({
  selector: 'app-product-card',
  standalone: true,
  template: `
    <div class="rounded-lg p-4 shadow-md" [style.background]="'var(--surface-foreground)'">
      <h2 class="font-bold text-lg">{{ product.name }}</h2>
      <p class="text-gray-500 mb-4">{{ product.description }}</p>
      <div class="flex justify-between items-center">
        <span class="text-2xl font-bold" [style.color]="'var(--primary-color)'">
          ${{ product.price }}
        </span>
        <button class="px-4 py-2 rounded" [style.background]="'var(--primary-color)'" [style.color]="'white'">
          Add to Cart
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: var(--spacing-3);
    }

    .product-card {
      transition: all var(--transition-duration) ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-2);
      }
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
}
```

### PrimeNG Component Theming

PrimeNG components automatically use theme CSS variables:

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TableModule],
  template: `
    <!-- PrimeNG components auto-theme -->
    <p-card class="mb-4">
      <ng-template pTemplate="header">
        <h2>Sales Dashboard</h2>
      </ng-template>

      <p-table [value]="products" styleClass="w-full">
        <p-column field="name" header="Product"></p-column>
        <p-column field="price" header="Price">
          <ng-template let-product="rowData">
            {{ product.price | formatCurrency }}
          </ng-template>
        </p-column>
        <p-column>
          <ng-template let-product="rowData">
            <p-button
              icon="pi pi-trash"
              [text]="true"
              (click)="delete(product)">
            </p-button>
          </ng-template>
        </p-column>
      </p-table>
    </p-card>

    <p-button label="Submit" (click)="submit()"></p-button>
  `
})
export class DashboardComponent {
  // All PrimeNG components use theme CSS variables automatically
}
```

## Responsive Design

### Breakpoints

TailwindCSS v4 default breakpoints:

```
sm: 640px   - Mobile landscape
md: 768px   - Tablet
lg: 1024px  - Desktop
xl: 1280px  - Large desktop
2xl: 1536px - Ultra-wide
```

### Responsive Components Example

```typescript
@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, NgFor],
  template: `
    <div class="grid
        grid-cols-1      <!-- Mobile: 1 column -->
        sm:grid-cols-2   <!-- Tablet landscape: 2 columns -->
        md:grid-cols-3   <!-- Tablet: 3 columns -->
        lg:grid-cols-4   <!-- Desktop: 4 columns -->
        xl:grid-cols-5   <!-- Large desktop: 5 columns -->
        gap-4">
      <app-product-card
        *ngFor="let product of products()"
        [product]="product">
      </app-product-card>
    </div>

    <!-- Responsive layout example -->
    <div class="flex
      flex-col           <!-- Mobile: vertical -->
      md:flex-row">      <!-- Tablet+: horizontal -->
      <div class="w-full md:w-1/3">Sidebar</div>
      <div class="w-full md:w-2/3">Content</div>
    </div>
  `
})
export class ProductGridComponent {
  @Input() products!: Signal<Product[]>;
}
```

### Mobile-First Development

Always start with mobile styles, then add media queries:

```scss
// Good: Mobile-first
.container {
  display: grid;
  grid-template-columns: 1fr; // Mobile

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr; // Tablet
  }

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr; // Desktop
  }
}

// Bad: Desktop-first
.container {
  grid-template-columns: 1fr 1fr 1fr;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
}
```

## Typography Guidelines

### Font Stack

```scss
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
$font-family-mono: 'SFMono-Regular', 'Menlo', 'Monaco', 'Courier New', monospace;
```

### Heading Hierarchy

```typography
h1: 32px / 1.2  - Page titles
h2: 28px / 1.3  - Section headers
h3: 24px / 1.4  - Subsection headers
h4: 20px / 1.5  - Sub-subsection headers
h5: 16px / 1.5  - Labels
h6: 14px / 1.6  - Small labels
p:  14px / 1.6  - Body text
small: 12px     - Small text, captions
code: 12px mono - Inline code
```

### Spacing Scale

```
0   - 0px
1   - 4px
2   - 8px
3   - 12px
4   - 16px
5   - 20px
6   - 24px
8   - 32px
10  - 40px
12  - 48px
16  - 64px
20  - 80px
24  - 96px
```

## Color Usage Patterns

### Button States

```typescript
// Primary button
<p-button
  label="Save"
  [style.background]="'var(--primary-color)'"
  [style.color]="'white'">
</p-button>

// Secondary button
<p-button
  label="Cancel"
  text
  [style.color]="'var(--text-color)'">
</p-button>

// Danger button
<p-button
  label="Delete"
  severity="danger"
  [style.background]="'var(--danger-color)'">
</p-button>

// Disabled state
<p-button
  label="Submit"
  [disabled]="form.invalid"
  [style.opacity]="form.invalid ? '0.5' : '1'">
</p-button>
```

### Alert & Status Colors

```scss
// Success - Green
.alert-success {
  background: var(--success-color);
  color: white;
}

// Warning - Yellow/Orange
.alert-warning {
  background: var(--warning-color);
  color: white;
}

// Danger - Red
.alert-danger {
  background: var(--danger-color);
  color: white;
}

// Info - Blue
.alert-info {
  background: var(--info-color);
  color: white;
}

// Neutral - Surface
.alert-neutral {
  background: var(--surface-50);
  color: var(--text-color);
  border: 1px solid var(--surface-border);
}
```

## Accessibility (A11y)

### Color Contrast

Ensure sufficient contrast between text and background:

```
WCAG AA: 4.5:1 for normal text
WCAG AAA: 7:1 for normal text
WCAG AA: 3:1 for large text
```

### Interactive Elements

```typescript
@Component({
  template: `
    <!-- Always provide labels -->
    <label for="product-name">Product Name</label>
    <input id="product-name" type="text" />

    <!-- Use aria-label if no visible label -->
    <button aria-label="Close dialog" (click)="close()">
      <span aria-hidden="true">&times;</span>
    </button>

    <!-- Use aria-describedby for help text -->
    <input id="email" type="email" aria-describedby="email-help" />
    <p id="email-help">Enter a valid email address</p>

    <!-- Use role for custom components -->
    <div role="progressbar" [attr.aria-valuenow]="progress" aria-valuemin="0" aria-valuemax="100"></div>
  `
})
export class AccessibleFormComponent {}
```

### Focus Management

```typescript
@Component({
  template: `
    <input #inputRef type="text" />
    <button (click)="focusInput()">Focus Input</button>
  `
})
export class FocusManagementComponent {
  @ViewChild('inputRef') inputRef!: ElementRef;

  focusInput(): void {
    this.inputRef.nativeElement.focus();
  }
}
```

## Icon Guidelines

### PrimeIcons Usage

```typescript
@Component({
  template: `
    <!-- Icon buttons -->
    <p-button icon="pi pi-plus" (click)="add()"></p-button>
    <p-button icon="pi pi-edit" [text]="true"></p-button>
    <p-button icon="pi pi-trash" severity="danger" [text]="true"></p-button>

    <!-- Icons in text -->
    <span>
      <i class="pi pi-check"></i>
      Completed
    </span>

    <!-- Sized icons -->
    <i class="pi pi-home text-xl"></i>
    <i class="pi pi-home text-2xl"></i>
    <i class="pi pi-home text-3xl"></i>

    <!-- Animated icons -->
    <i class="pi pi-spinner pi-spin"></i>
    <i class="pi pi-check-circle" style="color: var(--success-color)"></i>
  `
})
export class IconUsageComponent {}
```

## Component Design Patterns

### Card Component

```typescript
@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="rounded-lg p-6 shadow-md" [style.background]="'var(--surface-foreground)'">
      <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: var(--spacing-4);
    }

    div {
      transition: all var(--transition-duration) ease;

      &:hover {
        box-shadow: var(--shadow-2);
      }
    }
  `]
})
export class CardComponent {
  @Input() title!: string;
}

// Usage
<app-card title="Sales Overview">
  <p>Your sales content here</p>
</app-card>
```

### Form Input Component

```typescript
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="form-group">
      <label [for]="id" class="block mb-2 font-medium">{{ label }}</label>
      <input
        [id]="id"
        [type]="type"
        [formControl]="control"
        class="w-full px-3 py-2 border rounded"
        [style.borderColor]="control.invalid && control.touched ? 'var(--danger-color)' : 'var(--surface-border)'"
        [style.background]="'var(--surface-foreground)'">
      <small class="text-red-500 mt-1" *ngIf="control.invalid && control.touched">
        {{ errorMessage }}
      </small>
    </div>
  `
})
export class InputComponent {
  @Input() id!: string;
  @Input() label!: string;
  @Input() type = 'text';
  @Input() control!: FormControl;
  @Input() errorMessage = 'This field is required';
}
```

## Animation Guidelines

### Transition Duration

```scss
// Use consistent timing
--transition-fast: 150ms     // Micro interactions
--transition-normal: 300ms   // Default transitions
--transition-slow: 500ms     // Significant changes
```

### Easing Functions

```scss
// Common easing functions
--easing-ease-in: cubic-bezier(0.4, 0, 1, 1)
--easing-ease-out: cubic-bezier(0, 0, 0.2, 1)
--easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

### Animation Examples

```scss
// Fade in
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// Slide in
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

// Scale up
@keyframes scaleUp {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

// Usage
.modal {
  animation: fadeIn 300ms ease-in-out;
}

.toast {
  animation: slideIn 300ms ease-out;
}
```

## Design System Tokens

### Complete Token List

```json
{
  "color": {
    "primary": "var(--primary-500)",
    "secondary": "var(--accent-500)",
    "success": "var(--success-color)",
    "warning": "var(--warning-color)",
    "danger": "var(--danger-color)",
    "info": "var(--info-color)"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "typography": {
    "size": {
      "sm": "12px",
      "base": "14px",
      "lg": "16px",
      "xl": "20px",
      "2xl": "28px"
    },
    "weight": {
      "light": 300,
      "normal": 400,
      "semibold": 600,
      "bold": 700
    }
  },
  "border": {
    "radius": "6px",
    "width": "1px"
  },
  "shadow": {
    "sm": "0 1px 2px 0 rgba(0,0,0,0.05)",
    "base": "0 1px 3px 0 rgba(0,0,0,0.1)",
    "lg": "0 10px 15px -3px rgba(0,0,0,0.1)"
  }
}
```

## Best Practices

1. **Always use CSS variables** for colors and spacing
2. **Maintain consistent spacing** using the spacing scale
3. **Test dark mode** - ensure readability in both modes
4. **Mobile-first approach** - design for small screens first
5. **Accessible color contrast** - check WCAG compliance
6. **Use semantic HTML** - proper heading hierarchy, labels
7. **Keep animations subtle** - enhance, don't distract
8. **Document color decisions** - explain why colors were chosen
9. **Test on real devices** - not just responsive design mode
10. **Follow PrimeNG patterns** - consistency across components
