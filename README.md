# Sakai-ng Angular UI Template

Modern, production-ready Angular UI template built with Angular 20, PrimeNG 20, NgRx Signals, and TailwindCSS 4. Features a comprehensive admin dashboard, component showcase, CRUD operations, and theme customization system.

## Tech Stack

- **Angular 20** - Latest Angular framework with standalone components and signals
- **PrimeNG 20** - Rich UI component library with Aura theme
- **NgRx Signals** - Signal-based state management
- **TailwindCSS 4** - Utility-first CSS with PostCSS integration
- **RxJS 7.8** - Reactive programming patterns
- **Chart.js 4.4** - Data visualization library
- **TypeScript 5.8** - Static typing for JavaScript

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Angular CLI 20

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
# or: ng serve
```
Open http://localhost:4200 in your browser. Changes reload automatically.

### Production Build
```bash
npm run build
# or: ng build --configuration production
```

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Start dev server (localhost:4200) |
| `npm run build` | Production build optimized for performance |
| `npm run build:dev` | Development build |
| `npm run build:prod` | Optimized production build |
| `npm run watch` | Watch mode for development |
| `npm run format` | Format code with Prettier |
| `npm test` | Run unit tests (Karma) |

## Project Structure

```
src/
├── app/
│   ├── core/              # Core services, auth, interceptors, state
│   ├── features/          # Feature modules (dashboard, CRUD, UIKit)
│   ├── layout/            # App layout components (AppLayout, Topbar, Sidebar)
│   ├── pages/             # Routed pages (auth, landing, error pages)
│   ├── shared/            # Shared directives, pipes, models, types
│   ├── app.config.ts      # Application configuration & providers
│   ├── app.routes.ts      # Root routing configuration
│   └── app.component.ts   # Root component
├── assets/
│   ├── layout/            # SCSS layout system (14 files)
│   └── demo/              # Demo data and styles
├── environments/          # Environment-specific configurations
└── main.ts               # Application bootstrap
```

## Key Features

- **Authentication & Authorization** - JWT-based auth with role guards and session management
- **Responsive Layout** - Mobile-first design with sidebar, topbar, and footer
- **Theme System** - 3 presets × 16 colors × 8 surfaces = 384+ theme combinations
- **Admin Dashboard** - 5 widgets showing stats, sales, revenue, and notifications
- **CRUD Operations** - Full product management with PrimeNG Table
- **Component Showcase** - 14 PrimeNG component demo pages
- **Error Handling** - Global error handler with 3-tier error management
- **HTTP Interceptors** - API, auth, loading, and error interceptors
- **Dark Mode** - Automatic theme switching support
- **Data Services** - 6 specialized data services for business logic

## Documentation

See [docs/](./docs/) for comprehensive documentation:

- [Project Overview & PDR](./docs/project-overview-pdr.md) - Goals, features, requirements
- [Codebase Summary](./docs/codebase-summary.md) - Architecture and structure overview
- [Code Standards](./docs/code-standards.md) - Code organization and patterns
- [System Architecture](./docs/system-architecture.md) - Technical architecture details
- [Design Guidelines](./docs/design-guidelines.md) - Theme system and styling
- [Project Roadmap](./docs/project-roadmap.md) - Planned features and phases
- [Deployment Guide](./docs/deployment-guide.md) - Build and deployment instructions

## Code Scaffolding

Generate new components using Angular CLI:

```bash
ng generate component component-name
ng generate service service-name
ng generate directive directive-name
ng generate pipe pipe-name
```

See [Angular CLI docs](https://angular.dev/tools/cli) for complete command reference.

## Testing

Run unit tests with Karma:

```bash
npm test
```

## Support & Resources

- [Angular Documentation](https://angular.dev)
- [PrimeNG Components](https://primeng.org)
- [TailwindCSS Utilities](https://tailwindcss.com)
- [NgRx Signals](https://ngrx.io/guide/signals)
