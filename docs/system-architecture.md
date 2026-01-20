# System Architecture

**Version:** 20.0.0
**Last Updated:** January 15, 2026

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Angular 20 Single Page Application                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐  ┌─────────────┐  ┌────────────────────┐   │
│  │   Components   │  │   Services  │  │  State (Signals)   │   │
│  │                │  │             │  │                    │   │
│  │ - Smart        │  │ - Auth      │  │ - Theme State      │   │
│  │ - Presentational  │ - Data      │  │ - User State       │   │
│  │ - Layout       │  │ - Logger    │  │ - Loading State    │   │
│  └────────────────┘  └─────────────┘  └────────────────────┘   │
│         │                   │                    │               │
│         └───────────────────┼────────────────────┘               │
│                             │                                     │
│                    ┌────────▼────────┐                           │
│                    │  HttpClient     │                           │
│                    │  + Interceptors │                           │
│                    │                 │                           │
│                    │ 1. API          │                           │
│                    │ 2. Auth         │                           │
│                    │ 3. Loading      │                           │
│                    │ 4. Error        │                           │
│                    └────────┬────────┘                           │
│                             │                                     │
└─────────────────────────────┼─────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend API Server                           │
│  (REST endpoints at: api/auth, api/products, api/customers, etc.)│
└─────────────────────────────────────────────────────────────────┘
```

## Module Architecture

### Core Module (Dependency Injection Root)

```
CoreModule
├── Auth Subsystem
│   ├── authGuard - Route protection
│   ├── authInterceptor - JWT token injection
│   ├── SessionService - Session management
│   ├── AuthService - Auth operations
│   └── Models
│       └── auth.model.ts - Auth types
│
├── Config Subsystem
│   ├── api.config.ts - API endpoints
│   ├── app.config.ts - App configuration
│   └── constants.ts - Global constants
│
├── Internationalization Subsystem (Phase 1-5)
│   ├── LanguageService - Signal-based language state
│   │   ├── currentLang signal - Active language tracking
│   │   ├── availableLanguages - Supported languages (en, vi)
│   │   ├── setLanguage() - Change active language
│   │   ├── getInitialLanguage() - Detect browser/saved preference
│   │   ├── getCurrentLanguageInfo() - Returns language object with flag emoji
│   │   └── localStorage persistence
│   │
│   ├── TranslocoHttpLoader - Load translations from assets
│   │   └── Fetches /assets/i18n/{lang}.json
│   │
│   ├── provideTranslocoConfig - DI configuration
│   │   ├── availableLangs: ['en', 'vi']
│   │   ├── defaultLang: 'en'
│   │   ├── fallbackLang: 'en'
│   │   └── Missing key handling
│   │
│   ├── Localization Pipes (Phase 5)
│   │   ├── LocalizedDatePipe - Locale-aware date formatting
│   │   │   └── Injects LanguageService to detect current locale
│   │   └── LocalizedCurrencyPipe - Locale-aware currency formatting
│   │       └── Injects LanguageService to detect current locale
│   │
│   ├── Locale Registration (main.ts)
│   │   └── registerLocaleData(viLocale) - Enables Vietnamese date/currency formatting
│   │
│   └── Translation Files
│       └── /assets/i18n/{en,vi}.json - Language-specific strings
│
├── HTTP Subsystem
│   ├── BaseHttpService - Generic HTTP methods
│   ├── apiInterceptor - Base URL injection
│   ├── errorInterceptor - Error handling
│   ├── loadingInterceptor - Loading state
│   └── Models
│       ├── api.model.ts - API envelope
│       └── http.models.ts - HTTP types
│
├── Error Handling
│   ├── GlobalErrorHandler - Uncaught errors
│   ├── errorInterceptor - HTTP errors
│   └── error.model.ts - Error types
│
├── State Management (NgRx Signals)
│   ├── AppStore - Root store
│   ├── theme.signal.ts - Theme state
│   ├── user.signal.ts - User state
│   └── loading.signal.ts - Loading state
│
└── Services
    ├── Logger Service - Application logging
    ├── Notification Service - Toast/confirm dialogs
    ├── Customer Service - Customer data
    ├── Product Service - Product data
    ├── Order Service - Order data
    └── Analytics Service - Event tracking
```

### Features Module (Business Logic)

```
FeaturesModule
├── Dashboard Feature
│   ├── dashboard.component.ts - Main container
│   ├── Components
│   │   ├── stats-card.component.ts
│   │   ├── best-sellers.component.ts
│   │   ├── recent-sales.component.ts
│   │   ├── revenue-chart.component.ts
│   │   └── notifications.component.ts
│   └── dashboard.routes.ts
│
├── CRUD Feature
│   ├── product-list.component.ts - Table display
│   ├── product-form.component.ts - Add/Edit dialog
│   ├── product.service.ts - Extended ProductService
│   └── crud.routes.ts
│
└── UIKit Feature (Component Showcase)
    ├── uikit.component.ts - Main container
    ├── Components (14+ demos)
    │   ├── button-demo.component.ts
    │   ├── input-demo.component.ts
    │   ├── table-demo.component.ts
    │   ├── dialog-demo.component.ts
    │   └── ... (10+ more)
    └── uikit.routes.ts
```

### Layout Module (UI Shell)

```
LayoutModule
├── AppLayout - Root layout container
│   ├── Topbar - Navigation header
│   ├── Sidebar - Menu navigation
│   ├── Main Content - Route outlet
│   ├── Footer - Footer info
│   └── ThemeConfigurator - Theme switcher
│
├── Components
│   ├── app.layout.ts - Layout container
│   ├── topbar.component.ts - Top navigation
│   ├── app-sidebar.component.ts - Sidebar
│   ├── menu.component.ts - Menu items (recursive)
│   ├── footer.component.ts - Footer
│   ├── configurator.component.ts - Theme config
│   └── profile-menu.component.ts - User menu
│
└── Services
    └── LayoutService
        ├── sidebarVisible signal
        ├── menuItems signal
        ├── theme signal
        └── Methods: toggleSidebar(), setTheme(), etc.
```

### Pages Module (Routed Pages)

```
PagesModule
├── Auth Pages
│   ├── login.component.ts - Login form
│   ├── register.component.ts - Registration
│   ├── forgot-password.component.ts - Password reset
│   └── auth.routes.ts
│
├── Public Pages
│   ├── landing.component.ts - Marketing page
│   ├── documentation.component.ts - Getting started
│   ├── notfound.component.ts - 404 page
│   └── access-denied.component.ts - 403 page
│
└── pages.routes.ts
```

### Shared Module (Reusable Assets)

```
SharedModule
├── Directives (8 custom)
│   ├── click-outside.directive.ts - Detect outside clicks
│   ├── debounce.directive.ts - Input debouncing
│   ├── theme.directive.ts - Apply theme
│   ├── permissions.directive.ts - Show/hide by role
│   ├── highlight.directive.ts - Text highlighting
│   ├── tooltip.directive.ts - Custom tooltips
│   ├── scroll-to.directive.ts - Smooth scrolling
│   └── auto-focus.directive.ts - Auto-focus inputs
│
├── Pipes (15 custom)
│   ├── capitalize.pipe.ts - Capitalize text
│   ├── truncate.pipe.ts - Truncate strings
│   ├── format-currency.pipe.ts - Currency formatting
│   ├── format-date.pipe.ts - Date formatting
│   ├── safe-html.pipe.ts - HTML sanitization
│   ├── safe-url.pipe.ts - URL sanitization
│   ├── filter.pipe.ts - Array filtering
│   ├── sort.pipe.ts - Array sorting
│   ├── group-by.pipe.ts - Group array items
│   ├── get-initials.pipe.ts - Extract initials
│   ├── bytes.pipe.ts - File size formatting
│   ├── percentage.pipe.ts - Percentage formatting
│   ├── phone.pipe.ts - Phone number formatting
│   ├── localized-date.pipe.ts - Locale-aware date formatting (Phase 5)
│   │   └── Reacts to language changes, uses Angular DatePipe with current locale
│   └── localized-currency.pipe.ts - Locale-aware currency formatting (Phase 5)
│       └── Reacts to language changes, supports currency codes
│
└── Models & Types
    ├── component.model.ts - Component types
    ├── form.model.ts - Form types
    ├── table.model.ts - Table types
    ├── menu.model.ts - Menu types
    └── api.model.ts - API types
```

## Request/Response Flow

### HTTP Request Chain

```
Component/Service initiates request
        │
        ▼
1. API Interceptor (FIRST)
   └─ Adds base URL
      Request: GET /products
      Becomes: GET https://api.example.com/products

        │
        ▼
2. Auth Interceptor (SECOND)
   └─ Adds JWT token
      Headers: Authorization: Bearer {token}

        │
        ▼
3. Loading Interceptor (THIRD)
   └─ Sets loading state
      appStore.setLoading(true)

        │
        ▼
4. Error Interceptor (FOURTH)
   └─ Handles errors
      On 401/403/500: Transform error

        │
        ▼
HTTP Server
        │
        ▼
Response returns through interceptor chain
        │
        ▼
Service transforms data
        │
        ▼
Component receives data
        │
        ▼
View updates
```

### Data Transformation Pipeline

```
Raw API Response
    │
    ▼
├─ Error Interceptor: Check status
├─ Service: Transform to domain model
├─ AppStore (Signals): Cache/store result
└─ Component: Subscribe to signal/observable
    │
    ▼
Template renders with transformed data
```

## State Management with Signals

### AppStore Architecture

```
AppStore (Root State)
├── Theme State
│   ├── preset: signal('light')
│   ├── color: signal('blue')
│   ├── surface: signal('surface-0')
│   └── Methods: setTheme(), updateTheme()
│
├── User State
│   ├── currentUser: signal(null)
│   ├── roles: computed
│   └── Methods: setUser(), logout()
│
└── Loading State
    ├── isLoading: signal(false)
    ├── requestCount: signal(0)
    └── Methods: incrementLoading(), decrementLoading()

Usage in Components:
  constructor(appStore: AppStore) {
    this.theme = appStore.theme$();
    this.user = appStore.user$();
    this.isLoading = appStore.isLoading$();
  }
```

### Signal Reactivity

```
Signal Change
    │
    ▼
Computed signals update
    │
    ▼
Template automatically re-renders
    │
    ▼
No manual subscription needed
```

## Theme System Architecture

### Theme Configuration

```
ThemeConfigurator Component
        │
        ▼
User selects: Preset (Light/Dark) + Color + Surface
        │
        ▼
AppStore.setTheme({ preset, color, surface })
        │
        ▼
CSS Variables Updated
        │
        ├─ --primary-color
        ├─ --surface-background
        ├─ --text-color
        └─ (80+ more CSS vars)
        │
        ▼
PrimeNG Components (via CSS vars)
        │
        ▼
UI Automatically Updates (no re-render)
```

### Theme Combinations

```
3 Presets × 16 Colors × 8 Surfaces = 384 Themes

Presets:
├─ Light Mode
├─ Dark Mode
└─ Auto (follows system preference)

Colors (16):
├─ Blue, Cyan, Green, Lime, Purple
├─ Red, Pink, Orange, Yellow, Teal
├─ Indigo, Violet, Amber, Rose, Sky

Surfaces (8):
├─ Surface-0 (lightest)
├─ Surface-50
├─ Surface-100
├─ ... (surface levels)
└─ Surface-950 (darkest)
```

## Authentication Flow

### Login Flow

```
User Enters Credentials
        │
        ▼
Login Component
        │
        ▼
AuthService.login(email, password)
        │
        ▼
POST /api/auth/login
        │
        ▼
Backend validates credentials
        │
        ▼
Returns JWT token + User data
        │
        ▼
AuthInterceptor extracts token
        │
        ▼
SessionService stores token (localStorage/sessionStorage)
        │
        ▼
AppStore.setUser(userData)
        │
        ▼
Router navigates to /dashboard
```

### Request Authorization

```
Component initiates API request
        │
        ▼
AuthInterceptor runs
        │
        ├─ Check SessionService for token
        ├─ If token exists:
        │  └─ Add: Authorization: Bearer {token}
        │
        └─ If token missing/expired:
           └─ Trigger re-authentication

        │
        ▼
Request sent with Authorization header
        │
        ▼
Backend validates token
        │
        ├─ Valid: Process request
        └─ Invalid/Expired: Return 401
            │
            ▼
            ErrorInterceptor catches 401
            │
            ▼
            Redirect to /auth/login
```

## Error Handling Strategy

### Three-Layer Error Handling

```
Layer 1: Global Error Handler
┌─────────────────────────────────┐
│ Catches uncaught exceptions     │
│ Logs to console + analytics     │
│ Shows generic error UI          │
└─────────────────────────────────┘
                │
                ▼
Layer 2: HTTP Interceptor
┌─────────────────────────────────┐
│ Catches HTTP errors (4xx, 5xx) │
│ Transforms to standard format    │
│ Shows error toast               │
│ Handles 401/403 specially       │
└─────────────────────────────────┘
                │
                ▼
Layer 3: Service Error Handling
┌─────────────────────────────────┐
│ Domain-specific error handling  │
│ Data transformation errors      │
│ Validation errors               │
│ Rethrows or recovers            │
└─────────────────────────────────┘
                │
                ▼
Component Error Handling
┌─────────────────────────────────┐
│ catchError() in Observable      │
│ Set error state in component    │
│ Display error message to user   │
└─────────────────────────────────┘
```

## Dependency Injection Graph

```
Root Injector (app.config.ts)
├── Providers
│   ├── provideRouter()
│   ├── provideHttpClient()
│   ├── providePrimeNG()
│   ├── MessageService (PrimeNG)
│   ├── ConfirmationService (PrimeNG)
│   └── { provide: ErrorHandler, useClass: GlobalErrorHandler }
│
└── Feature Injectors
    ├── AuthService (@core/auth)
    ├── SessionService (@core/auth)
    ├── AppStore (@core/store)
    ├── BaseHttpService (@core/http)
    ├── LoggerService (@core/services)
    ├── NotificationService (@core/services)
    ├── ProductService (@core/services/data)
    ├── CustomerService (@core/services/data)
    ├── LayoutService (@layout/services)
    └── All component dependencies (auto-injected)

Injection Pattern:
  constructor(private service: SomeService) { }
  OR
  private service = inject(SomeService);
```

## Module Loading Strategy

### Eager Loading (Immediate)
```
AppLayout (main container)
├─ AppComponent
├─ Topbar
├─ Sidebar
├─ MenuComponent
└─ Footer
```

### Lazy Loading (On Demand)
```
Route /uikit → loadChildren: () => import('./app/features/uikit/uikit.routes')
Route /pages → loadChildren: () => import('./app/pages/pages.routes')
Route /auth → loadChildren: () => import('./app/pages/auth/auth.routes')

Benefits:
└─ Reduces initial bundle size
└─ Faster initial load
└─ Only load when needed
```

## Performance Optimizations (Phase 3+)

### Change Detection Strategy
```
OnPush Strategy (Recommended):
├─ Only runs CD when @Input/@Output change
├─ Automatic with signals
├─ Use in smart/container components
└─ Reduces CPU cycles dramatically

Pattern:
  @Component({
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class MyComponent { }
```

### List Rendering with TrackBy
```
Without TrackBy:
└─ Array changes → Recreate ALL DOM nodes (O(n))

With TrackBy:
├─ Array changes → Reuse matching nodes
├─ Only new/deleted items create/remove DOM (O(1))
└─ Better performance on lists 100+ items

Implementation:
  trackByProductId(index: number, item: Product): string {
    return item.id; // Unique stable identifier
  }

Template:
  <div *ngFor="let p of products(); trackBy: trackByProductId">
  <p-table [rowTrackBy]="trackByProductId">
```

### Pure Pipes (Default)
```
Pure Pipes (pure: true):
├─ Skip re-execution when inputs unchanged
├─ Require immutable updates to detect changes
└─ Essential for performance

Implementation:
  @Pipe({ name: 'orderBy', pure: true })

Immutable Updates Required:
  this.items = [...items, newItem];  // ✓ Pure pipe detects
  this.items.push(newItem);           // ✗ Pure pipe won't detect
```

### Memory Management
```
Unsubscribe Pattern:
  private destroy$ = new Subject<void>();

  constructor() {
    this.data$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(...);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

Alternative: Signals (auto-cleanup)
  this.data = signal(null);
  // No manual cleanup needed
```

### Bundle Optimization
- Tree-shaking for unused code
- Minification & uglification
- Gzip compression
- Code splitting (lazy loading)

## Security Layers

```
Browser Layer
├─ HttpOnly cookies (if using)
├─ XSS prevention (Angular DomSanitizer)
└─ CSRF tokens (XSRF-TOKEN)

HTTP Layer
├─ CORS validation
├─ JWT validation
├─ Rate limiting
└─ Input validation

Application Layer
├─ authGuard (route protection)
├─ Role-based access control
├─ Data sanitization
└─ Error message sanitization

Server Layer
├─ Token verification
├─ Permission validation
├─ SQL injection prevention
└─ Rate limiting
```

## Routing Architecture

### Route Hierarchy

```
AppRoutes (app.routes.ts)
├─ Path: '' (Protected by authGuard when enabled)
│  Component: AppLayout (Main container)
│  Children:
│  ├─ Path: '' (Default) → Dashboard
│  ├─ Path: 'uikit' → Lazy load UIKit routes
│  ├─ Path: 'documentation' → Documentation page
│  └─ Path: 'pages' → Lazy load Pages routes
│
├─ Path: 'landing' (Public) → Landing page
├─ Path: 'notfound' (Public) → 404 page
├─ Path: 'auth' → Lazy load Auth routes
│  └─ 'login', 'register', 'forgot-password'
│
└─ Path: '**' (Wildcard) → Redirect to /notfound
```

## API Contract Example

### Product Endpoint
```
GET /api/products
Response: {
  success: true,
  data: [
    { id: 1, name: 'Product 1', price: 100 },
    { id: 2, name: 'Product 2', price: 200 }
  ],
  timestamp: 1234567890
}

POST /api/products
Request: { name: 'New Product', price: 150 }
Response: { success: true, data: { id: 3, ... }, timestamp: ... }

PUT /api/products/1
Request: { name: 'Updated', price: 120 }
Response: { success: true, data: { id: 1, ... }, timestamp: ... }

DELETE /api/products/1
Response: { success: true, data: null, timestamp: ... }
```

## Summary

This architecture provides:
- **Scalability** - Modular structure grows with features
- **Maintainability** - Clear separation of concerns
- **Testability** - Dependency injection enables unit testing
- **Reusability** - Shared components, services, utilities
- **Performance** - Lazy loading, signals, tree-shaking
- **Security** - Multi-layer error handling and auth
- **Developer Experience** - Consistent patterns throughout
