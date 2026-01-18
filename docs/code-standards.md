# Code Standards & Patterns

**Version:** 20.3.0
**Last Updated:** January 18, 2026

## Overview

This document defines code organization, naming conventions, and architectural patterns used throughout the Sakai-ng codebase. Follow these standards to maintain consistency and readability.

## File & Folder Organization

### Naming Conventions

#### Files
- **Kebab-case** for all file names
- Descriptive names that indicate purpose
- Component files: `{name}.component.ts` (e.g., `product-list.component.ts`)
- Service files: `{name}.service.ts` (e.g., `auth.service.ts`)
- Guard files: `{name}.guard.ts` (e.g., `auth.guard.ts`)
- Interceptor files: `{name}.interceptor.ts` (e.g., `api.interceptor.ts`)
- Directive files: `{name}.directive.ts` (e.g., `app-click-outside.directive.ts`)
- Pipe files: `{name}.pipe.ts` (e.g., `capitalize.pipe.ts`)
- Model/Interface files: `{name}.model.ts` (e.g., `auth.model.ts`)
- Route files: `{name}.routes.ts` (e.g., `app.routes.ts`)

Good examples:
- `product-list-with-pagination.component.ts`
- `customer-data-transformation.service.ts`
- `date-format-utility.ts`

#### Folders
- **Kebab-case** for folder names
- Group by feature/domain, not by type
- Avoid generic names like `utils/`, `helpers/`, `common/`

```
src/app/features/
├── product-management/
│   ├── components/
│   │   ├── product-list.component.ts
│   │   ├── product-form.component.ts
│   │   └── product-detail.component.ts
│   ├── services/
│   │   └── product.service.ts
│   ├── models/
│   │   └── product.model.ts
│   └── product.routes.ts
```

#### Classes & Interfaces
- **PascalCase** for class names
- **Interface prefix** with `I` (optional but consistent)
- Export as default or named: `export class ProductService { }`

```typescript
// Good
export interface IProduct {
  id: number;
  name: string;
}

export class ProductService {
  constructor() {}
}

// Also acceptable (without I prefix)
export interface Product {
  id: number;
  name: string;
}
```

#### Functions, Variables, Properties
- **camelCase** for function names
- **camelCase** for variable/property names
- Private properties: use `#` (TypeScript private field)
- Protected properties: prefix with underscore `_`

```typescript
// Good
export class ProductService {
  private productCache = new Map();
  private #apiUrl = 'https://api.example.com';

  getProductById(id: number): Observable<Product> {
    // implementation
  }

  private transformProductData(data: any): Product {
    // implementation
  }
}
```

#### Constants
- **UPPER_SNAKE_CASE** for constants
- Group related constants

```typescript
// Good
export const API_TIMEOUT = 30000;
export const MAX_RETRY_ATTEMPTS = 3;
export const DEFAULT_PAGE_SIZE = 10;

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}
```

#### Enums
- **PascalCase** for enum names
- **UPPER_SNAKE_CASE** for enum values

```typescript
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}
```

## Component Patterns

### Standalone Components (Angular 20+)

All components in this project use standalone pattern.

```typescript
// Good: Standalone component
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `<p-button label="Add Product"></p-button>`,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProductListComponent {
  // implementation
}
```

### Component Structure

```typescript
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PrimeNGModule } from 'primeng/config';
import { ProductService } from '@core/services/product.service';
import { Product } from '@shared/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrimeNGModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" placeholder="Product name" />
      <button (click)="onSubmit()">Save</button>
    </form>
  `
})
export class ProductFormComponent implements OnInit {
  // 1. Public inputs
  @Input() product?: Product;
  @Input() isLoading = false;

  // 2. Public outputs
  @Output() saved = new EventEmitter<Product>();
  @Output() cancelled = new EventEmitter<void>();

  // 3. Public properties
  form: FormGroup;

  // 4. Private properties
  #productService = inject(ProductService);
  #formBuilder = inject(FormBuilder);

  // 5. Constructor (empty for standalone)
  constructor() {
    this.form = this.#formBuilder.group({
      name: ['', Validators.required],
      price: ['', Validators.required]
    });
  }

  // 6. Lifecycle hooks
  ngOnInit(): void {
    if (this.product) {
      this.form.patchValue(this.product);
    }
  }

  // 7. Public methods
  onSubmit(): void {
    if (this.form.valid) {
      this.saved.emit(this.form.value);
    }
  }

  // 8. Private methods
  private validateForm(): boolean {
    return this.form.valid;
  }
}
```

### Smart vs Presentational Components

**Smart Components** (containers):
- Handle data fetching
- Manage state
- Listen to services
- Pass data to presentational components

```typescript
@Component({
  selector: 'app-product-container',
  standalone: true,
  imports: [ProductListComponent],
  template: `
    <app-product-list
      [products]="products()"
      (deleted)="onProductDeleted($event)">
    </app-product-list>
  `
})
export class ProductContainerComponent {
  products = signal<Product[]>([]);

  #productService = inject(ProductService);

  constructor() {
    this.loadProducts();
  }

  loadProducts(): void {
    this.#productService.getProducts()
      .subscribe(products => this.products.set(products));
  }
}
```

**Presentational Components** (dumb):
- Receive data via @Input()
- Emit actions via @Output()
- No service dependencies
- Highly reusable

```typescript
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <p-table [value]="products()">
      <p-column field="name" header="Name"></p-column>
      <p-column>
        <ng-template let-product="rowData">
          <button (click)="onDelete(product)">Delete</button>
        </ng-template>
      </p-column>
    </p-table>
  `
})
export class ProductListComponent {
  @Input() products = signal<Product[]>([]);
  @Output() deleted = new EventEmitter<Product>();

  onDelete(product: Product): void {
    this.deleted.emit(product);
  }
}
```

## Service Patterns

### Base Service Pattern

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BaseDataService<T> {
  protected baseUrl = 'api/resources';
  protected error$ = new Subject<string>();
  protected loading$ = new BehaviorSubject<boolean>(false);

  constructor(protected http: HttpClient) {}

  getAll(): Observable<T[]> {
    this.loading$.next(true);
    return this.http.get<T[]>(`${this.baseUrl}`)
      .pipe(
        finalize(() => this.loading$.next(false)),
        catchError(error => {
          this.handleError(error);
          throw error;
        })
      );
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(error => {
          this.handleError(error);
          throw error;
        })
      );
  }

  create(item: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}`, item)
      .pipe(
        catchError(error => {
          this.handleError(error);
          throw error;
        })
      );
  }

  update(id: number, item: T): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${id}`, item)
      .pipe(
        catchError(error => {
          this.handleError(error);
          throw error;
        })
      );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(error => {
          this.handleError(error);
          throw error;
        })
      );
  }

  protected handleError(error: any): void {
    console.error('Service error:', error);
    this.error$.next(error.message || 'An error occurred');
  }
}
```

### Specialized Service Example

```typescript
import { Injectable } from '@angular/core';
import { BaseDataService } from '@core/http/base-http.service';
import { Product } from '@shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseDataService<Product> {
  override baseUrl = 'api/products';

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/search`, {
      params: { q: query }
    });
  }

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.baseUrl}/category/${categoryId}`
    );
  }
}
```

### Signal-Based Service

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { Product } from '@shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductSignalService {
  // State signals
  private products = signal<Product[]>([]);
  private selectedProductId = signal<number | null>(null);
  private loading = signal(false);

  // Computed signals
  selectedProduct = computed(() => {
    const id = this.selectedProductId();
    return this.products().find(p => p.id === id);
  });

  totalProducts = computed(() => this.products().length);

  // Public getters
  getProducts = () => this.products;
  getLoading = () => this.loading;

  // Methods to update state
  setProducts(products: Product[]): void {
    this.products.set(products);
  }

  selectProduct(id: number): void {
    this.selectedProductId.set(id);
  }

  addProduct(product: Product): void {
    this.products.update(products => [...products, product]);
  }
}
```

## State Management with Signals

### AppStore Pattern

```typescript
import { Injectable, signal } from '@angular/core';
import { Theme } from '@shared/models/theme.model';
import { User } from '@shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AppStore {
  // Theme state
  private theme = signal<Theme>({
    preset: 'light',
    color: 'blue',
    surface: 'surface-0'
  });

  // User state
  private user = signal<User | null>(null);

  // Loading state
  private isLoading = signal(false);

  // Public accessors
  theme$ = () => this.theme;
  user$ = () => this.user;
  isLoading$ = () => this.isLoading;

  // Setters
  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  setUser(user: User | null): void {
    this.user.set(user);
  }

  setLoading(isLoading: boolean): void {
    this.isLoading.set(isLoading);
  }

  // Updaters
  updateTheme(partial: Partial<Theme>): void {
    this.theme.update(t => ({ ...t, ...partial }));
  }
}
```

## Directive Patterns

### Standalone Directive with Inputs

```typescript
import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnInit {
  @Input() appHighlight = 'yellow';
  @Input() highlightColor = '#ffff00';

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.el.nativeElement.style.backgroundColor = this.highlightColor;
  }
}

// Usage: <div appHighlight="red"></div>
```

### Event Listener Directive

```typescript
import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.clickOutside.emit();
    }
  }

  constructor(private el: ElementRef) {}
}

// Usage: <div appClickOutside (clickOutside)="onClose()"></div>
```

## Pipe Patterns

### Pure Pipes (Recommended Default)

**Pure pipes** (default) only re-execute when input reference changes. Use for performance-critical transformations.

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize',
  standalone: true,
  pure: true  // Default - only re-runs on input reference change
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}

// Usage: {{ 'hello' | capitalize }} => "Hello"
```

**Important:** For pure pipes to detect array/object changes, ensure immutable updates:
```typescript
// Bad - mutates array, pure pipe won't detect change
this.items.push(newItem);

// Good - creates new reference, pure pipe detects change
this.items = [...this.items, newItem];
```

### Impure Pipes (Use Sparingly)

Only use `pure: false` when absolutely necessary (e.g., async operations). Impacts performance.

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
  pure: false  // Re-runs on every change detection cycle
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 10, ellipsis: string = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    return value.substring(0, limit) + ellipsis;
  }
}

// Usage: {{ text | truncate:20:'...' }} => "First 20 characters..."
```

## HTTP Interceptor Pattern

### Functional Interceptor (Angular 20+)

```typescript
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const customInterceptor: HttpInterceptor = (
  req: HttpRequest<any>,
  next: HttpHandler
): Observable<HttpEvent<any>> => {
  // Transform request
  const modifiedReq = req.clone({
    setHeaders: {
      'X-Custom-Header': 'value'
    }
  });

  return next.handle(modifiedReq);
};
```

### Error Handling Interceptor

```typescript
export const errorInterceptor: HttpInterceptor = (
  req: HttpRequest<any>,
  next: HttpHandler
): Observable<HttpEvent<any>> => {
  return next.handle(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Handle unauthorized
      }
      if (error.status === 403) {
        // Handle forbidden
      }
      throw error;
    })
  );
};
```

## Route Guard Pattern

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('ADMIN')) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};
```

## Model & Type Patterns

### Domain Model

```typescript
// Product.model.ts
export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCreateRequest = Omit<IProduct, 'id' | 'createdAt' | 'updatedAt'>;
export type ProductUpdateRequest = Partial<ProductCreateRequest>;

export class Product implements IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IProduct) {
    Object.assign(this, data);
  }

  isExpensive(): boolean {
    return this.price > 100;
  }
}
```

### API Response Model

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}
```

## Reactive Forms Pattern

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div>
        <label>Product Name</label>
        <input formControlName="name" type="text" />
        <span *ngIf="form.get('name')?.hasError('required')">Required</span>
      </div>

      <div>
        <label>Price</label>
        <input formControlName="price" type="number" />
        <span *ngIf="form.get('price')?.hasError('min')">Must be positive</span>
      </div>

      <button type="submit" [disabled]="form.invalid">Save</button>
    </form>
  `
})
export class ProductFormComponent implements OnInit {
  form: FormGroup;
  #formBuilder = inject(FormBuilder);

  constructor() {
    this.form = this.#formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
```

## Import/Export Conventions

### Barrel Exports

```typescript
// shared/directives/index.ts
export * from './app-click-outside.directive';
export * from './app-debounce.directive';
export * from './app-highlight.directive';

// Usage: import { ClickOutsideDirective } from '@shared/directives';
```

### Path Aliases

Always use path aliases for imports:

```typescript
// Good
import { ProductService } from '@core/services/product.service';
import { Product } from '@shared/models/product.model';

// Bad - avoid relative paths
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../shared/models/product.model';
```

## Documentation Comments

### JSDoc Comments

```typescript
/**
 * Calculates the total price including tax.
 *
 * @param basePrice The base price before tax
 * @param taxRate The tax rate as decimal (e.g., 0.1 for 10%)
 * @returns The total price with tax applied
 * @example
 * const total = calculateTotal(100, 0.1); // returns 110
 */
function calculateTotal(basePrice: number, taxRate: number): number {
  return basePrice * (1 + taxRate);
}
```

### Component Documentation

```typescript
/**
 * ProductListComponent displays a list of products with filtering and sorting.
 *
 * This component:
 * - Fetches products from the ProductService
 * - Displays them in a PrimeNG table
 * - Allows filtering by name and category
 * - Emits events when products are selected
 *
 * @example
 * <app-product-list (selected)="onProductSelected($event)"></app-product-list>
 */
@Component({
  selector: 'app-product-list',
  // ...
})
export class ProductListComponent {
  // ...
}
```

## Error Handling

### Service Error Handling

```typescript
@Injectable()
export class ProductService {
  handleError(error: any, message: string = 'An error occurred'): Observable<never> {
    console.error(message, error);
    return throwError(() => new Error(message));
  }
}
```

### Component Error Handling

```typescript
@Component({})
export class ProductListComponent {
  products: Product[] = [];
  error: string | null = null;

  constructor(private productService: ProductService) {}

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.error = null;
      },
      error: (error) => {
        this.error = error.message;
        console.error('Failed to load products', error);
      }
    });
  }
}
```

## Modularization Strategy (Phase 2+)

### Component Modularization Example

When components grow beyond 200 lines, split into modular folders with separated concerns:

**Before (Monolithic):**
```
table-demo.ts (400+ lines)
  - Component logic
  - Data definitions
  - Helper functions
  - HTML template
```

**After (Modularized):**
```
table-demo/
├── table-demo.component.ts      # Component logic only
├── table-demo.data.ts            # Mock data & constants
├── table-demo.helpers.ts         # Helper functions
├── table-demo.component.html     # Template
└── index.ts                      # Barrel export
```

### Service Modularization Example

Split services with multiple responsibilities:

**Before:**
```
logger.service.ts (250 lines)
  - Logging core logic
  - Log formatting
  - Timestamp handling
```

**After:**
```
logger/
├── logger.service.ts             # Core service
├── log-formatter.ts              # Formatting logic
└── index.ts                      # Barrel export
```

### HTTP Utilities Modularization

Extract HTTP-related utilities:

```
core/http/
├── base-http.service.ts          # Base HTTP client
├── http-params-builder.ts        # Query parameter building (Phase 2)
├── http-error-handler.ts         # Error handling utilities (Phase 2)
├── http.models.ts                # API response models
├── api.model.ts                  # Standard API envelope
└── index.ts                      # Barrel export
```

### Benefits of Modularization
- **Readability** - Each file has single responsibility
- **Maintainability** - Easier to locate and update specific logic
- **Reusability** - Helpers can be imported independently
- **Testing** - Smaller, focused test files
- **Performance** - Better tree-shaking with separated concerns

## Performance Optimization Patterns (Phase 3+)

### TrackBy Function for Lists

Use `trackBy` with `*ngFor` and PrimeNG tables to optimize list rendering. Without trackBy, Angular recreates every DOM element when list changes.

```typescript
// Component
export class ProductListComponent {
  products = signal<Product[]>([]);

  trackByProductId(index: number, item: Product): string {
    return item.id; // Unique identifier
  }
}
```

```html
<!-- Template -->
<div *ngFor="let product of products(); trackBy: trackByProductId">
  {{ product.name }}
</div>

<!-- PrimeNG Table -->
<p-table [value]="products()" [rowTrackBy]="trackByProductId">
  <p-column field="name" header="Name"></p-column>
</p-table>
```

**Benefits:**
- Reduces DOM node creation from O(n) to O(1) for unchanged items
- Preserves input focus and scroll position
- Improves performance on large lists (100+ items)

### ChangeDetectionStrategy.OnPush

Use OnPush strategy for smart/container components to reduce change detection cycles.

```typescript
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-product-list',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  @Input() products: Product[] = [];
  @Output() deleted = new EventEmitter<Product>();
}
```

**Benefits:**
- Only runs change detection when @Input/@Output change
- Works seamlessly with signals (automatic optimization)
- Reduces CPU usage on large applications

### Pure Pipes (Default)

Mark pipes as `pure: true` to skip re-execution when inputs don't change.

```typescript
@Pipe({
  name: 'orderBy',
  pure: true  // Essential for performance
})
export class OrderByPipe implements PipeTransform {
  transform<T>(items: T[], field: keyof T): T[] {
    return [...items].sort((a, b) => {
      // Sort logic
    });
  }
}
```

**Key Rule:** Always use immutable updates with pure pipes:
```typescript
// Pure pipes won't detect this change
this.items.push(newItem);

// Use this instead - creates new reference
this.items = [...this.items, newItem];
```

## Accessibility Patterns (Phase 5+)

### ARIA Labels for Icon-Only Buttons

Always provide descriptive aria-label for buttons with only icons:

```typescript
// Template
<p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true"
          (click)="editItem()" aria-label="Edit item" />
<p-button icon="pi pi-trash" severity="danger" [rounded]="true"
          (click)="deleteItem()" aria-label="Delete item" />

// Do NOT use
<p-button icon="pi pi-pencil" [rounded]="true"></p-button>  <!-- Inaccessible -->
```

### ARIA Labels for Data Tables

Include aria-label on tables for screen reader context:

```html
<p-table [value]="items" aria-label="Items management table">
  <!-- Table content -->
</p-table>
```

### Form Input Accessibility

Ensure all form inputs have proper associations and error messaging:

```html
<label for="productName" class="block font-bold mb-3">Name</label>
<input type="text" id="productName"
       [attr.aria-describedby]="submitted && !product.name ? 'name-error' : null" />
<small id="name-error" class="text-red-500" *ngIf="submitted && !product.name">
  Name is required.
</small>
```

### Dialog Accessibility

Use aria-labelledby to connect dialog header:

```html
<p-dialog [(visible)]="dialogVisible" header="Product Details"
          aria-labelledby="product-dialog-title">
  <ng-template #content>
    <!-- Dialog content -->
  </ng-template>
</p-dialog>
```

### Image Alt Text

Always provide meaningful alt text for images:

```html
<!-- Good -->
<img [src]="imagePath" [alt]="product.name" />
<img [src]="logoPath" alt="Company logo" />

<!-- Bad - Avoid -->
<img [src]="imagePath" alt="Image" />
<img [src]="imagePath" />
```

### Semantic HTML

Use semantic elements for better accessibility:

```html
<!-- Good -->
<nav>Navigation menu</nav>
<main>Main content</main>
<footer>Footer section</footer>
<aside>Sidebar</aside>

<!-- Avoid generic divs where semantic elements apply -->
<div>Navigation menu</div>  <!-- Use <nav> instead -->
```

### Color Contrast

Ensure text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text):
- Use utility classes with proper contrast ratios
- Test with tools like WebAIM Contrast Checker
- Don't rely on color alone to convey information

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:
- Use native form elements and buttons
- Maintain logical tab order
- Provide visible focus indicators
- Test with keyboard-only navigation

### Guidelines Summary
- **Buttons:** Always use aria-label for icon-only buttons
- **Tables:** Add aria-label for context
- **Forms:** Use proper label associations and error descriptions
- **Images:** Include meaningful alt text
- **Dialogs:** Use aria-labelledby for headers
- **Color:** Don't rely on color alone
- **Keyboard:** Ensure full keyboard accessibility
- **Focus:** Maintain visible focus indicators

## Code Quality Rules

1. **Keep components under 200 lines** - Split larger components into modularized folders
2. **Single Responsibility Principle** - One purpose per file/class
3. **DRY** - Avoid code duplication, extract to services or helpers
4. **YAGNI** - Don't add features that aren't needed
5. **Type Safety** - Use TypeScript strict mode always
6. **Error Handling** - All API calls should have error handlers
7. **Comments** - Explain "why", not "what"
8. **Testing** - Aim for 80%+ coverage on core modules
9. **Modularization** - Follow Phase 2+ modularization patterns when components exceed 200 lines
10. **Performance** - Use trackBy for lists, OnPush for change detection, pure pipes for transformations
11. **Accessibility** - Follow Phase 5+ accessibility patterns for ARIA labels, semantic HTML, and keyboard navigation

## Security & Data Validation Patterns (Phase 4+)

### Input Validation

Strengthen validation in form components to prevent invalid data submission:

```typescript
// Login component with email validation
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  email = signal('');
  password = signal('');

  // Computed signal to validate form readiness
  isFormValid = computed(() => {
    const emailVal = this.email().trim();
    const passwordVal = this.password().trim();
    return emailVal.length > 0 && passwordVal.length > 0;
  });

  onLogin(): void {
    if (!this.isFormValid()) {
      this.notificationService.warn('Please enter valid credentials');
      return;
    }
    // Proceed with login
  }
}
```

### XSS Prevention with Safe Pipe

Use the safe pipe for sanitizing dynamic content from untrusted sources:

```typescript
// Pipe pattern with multi-type sanitization
@Pipe({
  name: 'safe',
  pure: true,
  standalone: true
})
export class SafePipe implements PipeTransform {
  transform(value: string, type: 'html' | 'style' | 'url' | 'resourceUrl'): SafeHtml | ... {
    switch (type) {
      case 'html':
        // Sanitize first, then trust
        const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, value);
        return this.sanitizer.bypassSecurityTrustHtml(sanitized || '');
      case 'url':
        // Prevent javascript: protocol attacks
        const sanitizedUrl = this.sanitizer.sanitize(SecurityContext.URL, value);
        return this.sanitizer.bypassSecurityTrustUrl(sanitizedUrl || '');
      // ... other types
    }
  }
}
```

Template usage:
```html
<!-- Safe HTML rendering with sanitization -->
<div [innerHTML]="userComment | safe: 'html'"></div>

<!-- Safe URL binding -->
<a [href]="dynamicLink | safe: 'url'">Safe Link</a>
```

### Notification Constants

Centralize notification timing for consistency:

```typescript
// notification.constants.ts
export const NOTIFICATION_DEFAULT_LIFE = 3000;    // Standard: 3 seconds
export const NOTIFICATION_MEDIUM_LIFE = 5000;     // Errors: 5 seconds
export const NOTIFICATION_EXTENDED_LIFE = 7000;   // Validation: 7 seconds

// Usage in service
this.messageService.add({
  severity: 'error',
  summary: 'Error',
  detail: 'Validation failed',
  life: NOTIFICATION_EXTENDED_LIFE
});
```

### Status Severity Mapping Utility

Provide type-safe status to severity conversion:

```typescript
// severity.utils.ts
export type TagSeverity = 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast';

export function getStatusSeverity(status: string | undefined | null): TagSeverity {
  if (!status) return 'info';

  // Pre-defined status sets for consistency
  const SUCCESS_STATUSES = new Set(['INSTOCK', 'COMPLETED', 'APPROVED']);
  const WARNING_STATUSES = new Set(['LOWSTOCK', 'PENDING', 'PROCESSING']);
  const DANGER_STATUSES = new Set(['OUTOFSTOCK', 'CANCELLED', 'FAILED']);

  if (SUCCESS_STATUSES.has(status.trim())) return 'success';
  if (WARNING_STATUSES.has(status.trim())) return 'warn';
  if (DANGER_STATUSES.has(status.trim())) return 'danger';
  return 'info';
}

// Template usage with PrimeNG tags
<p-tag [value]="product.status" [severity]="product.status | getStatusSeverity"></p-tag>
```

### Helper Functions for CRUD

Organize common transformation and validation logic:

```typescript
// crud.helpers.ts - Centralized CRUD utilities
export function validateProductData(product: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!product.name?.trim()) errors.push('Name is required');
  if (!product.price || product.price < 0) errors.push('Price must be positive');

  return { valid: errors.length === 0, errors };
}

export function transformProductForAPI(product: Partial<Product>): any {
  return {
    ...product,
    name: product.name?.trim(),
    price: Number(product.price)
  };
}
```
