# Codebase Summary

**Version:** 20.0.1
**Last Updated:** January 17, 2026

## Directory Structure Overview

```
src/
├── app/                           # Angular application root
│   ├── core/                      # Core application services & infrastructure (42 files, ~15K LOC)
│   │   ├── auth/                  # Authentication & authorization
│   │   ├── config/                # Application & API configuration
│   │   ├── errors/                # Global error handling
│   │   ├── http/                  # HTTP client & interceptors
│   │   ├── interceptors/          # HTTP request/response interceptors
│   │   ├── services/              # Core business services
│   │   └── store/                 # NgRx Signals state management
│   │
│   ├── features/                  # Feature modules (29 files, ~4K LOC)
│   │   ├── crud/                  # Product CRUD operations
│   │   ├── dashboard/             # Admin dashboard with widgets
│   │   └── uikit/                 # PrimeNG component showcase (14+ demos)
│   │
│   ├── layout/                    # Application layout (12 files, ~1.2K LOC)
│   │   ├── components/            # Layout structural components
│   │   └── services/              # Layout state management (LayoutService)
│   │
│   ├── pages/                     # Routed pages (15 files, ~900 LOC)
│   │   ├── auth/                  # Login, register, access-denied pages
│   │   ├── landing/               # Public marketing landing page
│   │   ├── documentation/         # Getting started guide
│   │   ├── empty/                 # Empty state page template
│   │   └── notfound/              # 404 Not Found page
│   │
│   ├── shared/                    # Reusable utilities (28 files, ~1.4K LOC)
│   │   ├── models/                # TypeScript type definitions
│   │   ├── directives/            # 8 custom directives
│   │   ├── pipes/                 # 13 custom pipes
│   │   └── index.ts               # Barrel exports
│   │
│   ├── app.component.ts           # Root component
│   ├── app.config.ts              # Dependency injection configuration
│   ├── app.routes.ts              # Root route configuration
│   └── index.ts                   # App barrel export
│
├── assets/
│   ├── layout/                    # SCSS layout system (14 files)
│   │   ├── _appsidebar.scss       # Sidebar styles
│   │   ├── _topbar.scss           # Top navigation styles
│   │   ├── _configurator.scss     # Theme configurator styles
│   │   ├── _menu.scss             # Menu item styles
│   │   ├── _footer.scss           # Footer styles
│   │   ├── _layout.scss           # Main layout styles
│   │   ├── _variables.scss        # CSS custom properties
│   │   └── ...other SCSS files
│   │
│   └── demo/                      # Demo data and styling
│       ├── data/                  # Mock data (customers, products, orders)
│       └── styles/                # Demo-specific styles
│
├── environments/
│   ├── environment.ts             # Development config
│   └── environment.prod.ts        # Production config
│
├── styles.scss                    # Global styles
└── main.ts                        # Application bootstrap

public/
├── index.html                     # HTML entry point
└── favicon.ico                    # Favicon

Configuration Files:
├── angular.json                   # Angular CLI configuration
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── karma.conf.js                  # Test runner configuration
├── package.json                   # Dependencies and scripts
├── .eslintrc.json                 # ESLint configuration
└── .prettierrc                    # Code formatter configuration
```

## File Statistics

| Module | Files | Est. LOC | Type |
|--------|-------|----------|------|
| Core | 42 | 15,000 | Services, guards, interceptors, state |
| Features | 29 | 4,000 | Components, dashboards, demos |
| Layout | 12 | 1,200 | Components, services |
| Pages | 15 | 900 | Routable pages |
| Shared | 28 | 1,400 | Directives, pipes, models |
| Assets | 20+ | 2,000+ | SCSS, demo data |
| **Total** | **~150** | **~24,500** | |

## Core Module Breakdown

### Authentication (`core/auth/`)
- **auth.guard.ts** - Route protection guard
- **auth.routes.ts** - Auth route configuration
- **auth.interceptor.ts** - Adds JWT to requests
- **session.service.ts** - Session management
- **models/** - Auth-related TypeScript interfaces

### Configuration (`core/config/`)
- **api.config.ts** - API endpoint definitions
- **app.config.ts** - App-wide constants
- **constants.ts** - Global constants

### HTTP Layer (`core/http/`)
- **base-http.service.ts** - Generic HTTP methods
- **http.models.ts** - API response models
- **api.model.ts** - Standard API envelope

### Interceptors (`core/interceptors/`)
- **api.interceptor.ts** - Adds base API URL (1st priority)
- **auth.interceptor.ts** - JWT authentication (2nd priority)
- **loading.interceptor.ts** - Loading state (3rd priority)
- **error.interceptor.ts** - Error handling (4th priority)

### State Management (`core/store/`)
- **app.store.ts** - NgRx Signals root store
- **theme.signals.ts** - Theme state (preset, color, surface)
- **user.signals.ts** - User/auth state
- **loading.signals.ts** - Loading indicators

### Error Handling (`core/errors/`)
- **global-error-handler.ts** - Catch all unhandled errors
- **error.model.ts** - Error type definitions

### Services (`core/services/`)
- **logger.service.ts** - Application logging
- **notification.service.ts** - User notifications (toast, confirm)
- **data/**
  - **customer.service.ts** - Customer CRUD (293 KB, large demo dataset)
  - **product.service.ts** - Product management
  - **order.service.ts** - Order tracking
  - **notification.service.ts** - Notification management

## Features Module Breakdown

### Dashboard (`features/dashboard/`)
- **dashboard.component.ts** - Main dashboard container
- **widgets/** - 5 dashboard widgets
  - **stats-card.component.ts** - KPI display
  - **best-sellers.component.ts** - Product table
  - **recent-sales.component.ts** - Transaction log
  - **revenue-chart.component.ts** - Sales chart
  - **notifications.component.ts** - Alert panel

### CRUD (`features/crud/`)
- **product-list.component.ts** - Product table with filtering
- **product-form.component.ts** - Add/edit product dialog
- **product.service.ts** - Product API calls

### UIKit (`features/uikit/`)
- **uikit.routes.ts** - UIKit routing
- **components/** - 14+ demo components
  - **buttondemo.ts** - Button components
  - **inputdemo.ts** - Form inputs
  - **tabledemo.ts** - Data tables
  - **treedemo.ts** - Tree views
  - **menudemo.ts** - Menu components
  - **dialogdemo.ts** - Modal dialogs
  - **toastdemo.ts** - Toast notifications
  - **chartdemo.ts** - Chart visualizations
  - **filledemo.ts** - File upload
  - **calendardemo.ts** - Calendar picker
  - **pagiandordemo.ts** - Pagination/sorting
  - **overlaysdemo.ts** - Overlay components
  - **confirmationdemo.ts** - Confirmation dialogs
  - **spinnersdemo.ts** - Loading spinners

## Layout Module Breakdown

### Components (`layout/components/`)
- **app.layout.ts** - Root layout container (sidebar + topbar + content + footer)
- **topbar.component.ts** - Top navigation bar
- **app-sidebar.component.ts** - Left sidebar with menu
- **menu.component.ts** - Recursive menu items
- **footer.component.ts** - Footer with links
- **configurator.component.ts** - Theme/layout customizer
- **profile-menu.component.ts** - User profile dropdown

### Services (`layout/services/`)
- **layout.service.ts** - Signal-based layout state (menu visibility, theme)

## Pages Module Breakdown

### Auth Pages (`pages/auth/`)
- **login.component.ts** - Login form with validation
- **register.component.ts** - Registration form
- **forgot-password.component.ts** - Password recovery
- **auth.routes.ts** - Auth routing

### Public Pages
- **landing.component.ts** - Marketing landing page (6 sections)
- **documentation.component.ts** - Getting started docs
- **notfound.component.ts** - 404 error page
- **access-denied.component.ts** - 403 error page

## Shared Module Breakdown

### Directives (`shared/directives/`)
8 custom directives with full test coverage:
- **app-click-outside.directive.ts** - Detect clicks outside element
- **app-debounce.directive.ts** - Debounce input events
- **app-theme.directive.ts** - Apply dynamic themes
- **has-role.directive.ts** - Show/hide based on user roles (AuthService integrated)
- **has-permission.directive.ts** - Show/hide based on permissions (AuthService integrated)
- **app-highlight.directive.ts** - Text highlighting
- **app-tooltip.directive.ts** - Custom tooltips
- **app-scroll-to.directive.ts** - Smooth scrolling
- **app-auto-focus.directive.ts** - Auto-focus inputs

**Authorization Directives (v20.0.1)**
- Real-time role/permission checking via AuthService
- Reactive to authentication state changes
- Client-side only (backend must re-verify)
- Full test coverage (11 tests)

### Pipes (`shared/pipes/`)
13 custom pipes:
- **capitalize.pipe.ts** - Capitalize text
- **truncate.pipe.ts** - Truncate text
- **format-currency.pipe.ts** - Currency formatting
- **format-date.pipe.ts** - Date formatting
- **safe-html.pipe.ts** - Sanitize HTML
- **safe-url.pipe.ts** - Sanitize URLs
- **filter.pipe.ts** - Array filtering
- **sort.pipe.ts** - Array sorting
- **group-by.pipe.ts** - Group array items
- **get-initials.pipe.ts** - Extract initials from names
- **bytes.pipe.ts** - Format bytes to readable size
- **percentage.pipe.ts** - Format percentages
- **phone.pipe.ts** - Format phone numbers

### Models & Types (`shared/models/`)
- **component.model.ts** - Component property types
- **form.model.ts** - Form validation types
- **table.model.ts** - DataTable configuration types
- **menu.model.ts** - Menu item structures
- **api.model.ts** - API response types

## Technology Stack Details

### Frontend Framework
- **Angular 20** - Latest version with signals, standalone components
- **RxJS 7.8** - Reactive programming with Observables
- **Zone.js 0.15** - Change detection

### UI Components & Styling
- **PrimeNG 20** - 80+ pre-built components
- **TailwindCSS 4** - Utility-first CSS (post 2024)
- **PrimeUIX Themes** - Aura theme with customization
- **SCSS** - Layout system with variables

### State Management
- **NgRx Signals** - Signal-based reactive state (Angular 20 native)
- Alternative to RxJS BehaviorSubject

### Data & APIs
- **HttpClient** - Built-in Angular HTTP module
- **Chart.js** - Data visualization (4.4.2)

### Developer Tools
- **TypeScript 5.8** - Strict mode enabled
- **ESLint** - Code quality checking
- **Prettier** - Code formatting
- **Karma** - Unit test runner
- **Jasmine** - Testing framework

## Key Architectural Decisions

### 1. Standalone Components
All components use Angular 20 standalone pattern (no NgModule needed).

### 2. Signal-Based State
NgRx Signals for reactive, simple state management over traditional NgRx store.

### 3. Functional Interceptors
HTTP interceptors use functional approach (more performant, composable).

### 4. Route-Based Lazy Loading
Feature modules loaded on-demand via lazy loading routes.

### 5. Service-Based Architecture
Business logic isolated in services, components for presentation.

### 6. SCSS Layout System
14 SCSS files provide flexible, composable layout system instead of inline styles.

### 7. Theme System Architecture
CSS variables + JavaScript signals = dynamic theming without component recompilation.

### 8. Centralized Configuration
API endpoints, constants in dedicated config modules.

## Import Path Aliases

TypeScript path mappings for cleaner imports:

```json
{
  "@core/*": "src/app/core/*",
  "@features/*": "src/app/features/*",
  "@layout/*": "src/app/layout/*",
  "@pages/*": "src/app/pages/*",
  "@shared/*": "src/app/shared/*",
  "@env/*": "src/environments/*",
  "@assets/*": "src/assets/*"
}
```

Example usage:
```typescript
// Instead of: import { AuthService } from '../../../../core/auth/services/auth.service'
import { AuthService } from '@core/auth/services/auth.service';
```

## Performance Characteristics

### Bundle Size
- Uncompressed: ~2-3 MB
- Gzipped: ~500 KB
- Tree-shakeable dependencies

### Build Time
- Development: ~15-30 seconds
- Production: ~60 seconds

### Load Time
- Initial load: <3 seconds (4G)
- Time to interactive: <5 seconds

### Memory
- Average runtime: 20-30 MB
- Signals reduce memory vs RxJS subscriptions

## Testing Coverage

- Test runner: Karma
- Framework: Jasmine
- Components: Tested via component harness
- Services: Unit tested in isolation
- Coverage target: 80%+ for core modules
