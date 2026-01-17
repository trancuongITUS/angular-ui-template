# Project Changelog

**Format:** [ISO 8601 dates] | Conventional Commits
**Last Updated:** January 17, 2026

---

## [20.0.1] - 2026-01-17

### Added
- **Test Coverage:** 11 new unit tests for authorization directives
  - `has-role.directive.spec.ts` - 5 tests (role checking, reactive updates, error handling)
  - `has-permission.directive.spec.ts` - 6 tests (permission checking, multiple roles, edge cases)

### Fixed
- **Security:** Authorization directives now perform actual role/permission checking
  - `has-role.directive.ts` - Integrated AuthService for real-time role verification
  - `has-permission.directive.ts` - Integrated AuthService for real-time permission verification
  - Directives now reactive to authentication state changes
  - Added defensive error handling for missing AuthService

- **Bug:** Fixed theme logic inversion in LayoutService (line 65)
  - Dark mode toggle now works correctly

- **Memory Leak:** Fixed subscription leak in app.menuitem.ts
  - Implemented `takeUntil` pattern for proper cleanup
  - Removed duplicate service provider

### Security Notes
- Authorization directives are **client-side only** - backend MUST re-verify all permissions
- Documented in directive comments for maintainability
- CSP headers remain primary defense against XSS

### Changed
- Improved directive documentation with security warnings
- Enhanced test coverage for authorization layer

### Test Results
- All 11 new tests passing
- No regression in existing tests
- Ready for production deployment

### Files Modified
- `src/app/shared/directives/has-role.directive.ts`
- `src/app/shared/directives/has-permission.directive.ts`
- `src/app/layout/services/layout.service.ts`
- `src/app/layout/components/app.menuitem.ts`

### Files Added
- `src/app/shared/directives/has-role.directive.spec.ts`
- `src/app/shared/directives/has-permission.directive.spec.ts`

---

## [20.0.0] - 2026-01-15

### Added
- Angular 20 project setup with standalone components & signals
- PrimeNG 20 integration (80+ components)
- TailwindCSS 4 with PrimeUIX Aura theme
- Authentication system with JWT tokens
- Authorization directives (client-side role/permission checking)
- Route guards (authGuard, adminGuard)
- HTTP interceptor chain (API, Auth, Loading, Error)
- Global error handler with 3-tier approach
- NgRx Signals state management (theme, user, loading)
- Responsive layout system (14 SCSS files)
- Theme configurator (3 presets × 16 colors × 8 surfaces)
- Admin dashboard with 5 widgets
- Product CRUD operations
- UIKit showcase (14+ PrimeNG component demos)
- Custom directives (8 total)
- Custom pipes (13 total)
- Complete documentation structure
- Code standards guide
- System architecture documentation

### Technical Details
- Files: 156 total
- Lines of Code: ~24,500
- Bundle Size: ~2-3 MB (gzipped: ~500 KB)
- Build Time: ~60 seconds
- Test Framework: Karma/Jasmine
- Coverage Target: 80%+

### Known Limitations
- Authentication not integrated with real backend
- Mock data for dashboard/CRUD operations
- No real-time data updates
- Limited testing setup (no E2E tests)
- No PWA/offline support
- English-only (no i18n)

### Security Notes
- JWT tokens stored in localStorage (XSS vulnerable - mitigated by CSP headers)
- ClientSide authorization directives (backend must re-verify)
- CSP headers configured to prevent unauthorized script execution

---

## Release Notes

### Version Support
- **20.0.0**: Stable (Released Jan 15, 2026) - 12 months support
- **20.0.1**: Stable (Released Jan 17, 2026) - Bug fixes & security improvements

### Next Planned Release
- **20.1.0**: Planned Q2 2026 - Phase 2 enhancements
  - Testing infrastructure
  - Form enhancements
  - API integration guide
  - Performance optimization

### Breaking Changes
- None in 20.0.1 (backward compatible)

---

## Upgrade Guide

### From 20.0.0 to 20.0.1
No breaking changes. Simply update to latest and redeploy.

```bash
git pull origin main
npm install
npm run build
```

---

## Documentation References

- [System Architecture](./system-architecture.md)
- [Code Standards](./code-standards.md)
- [Project Roadmap](./project-roadmap.md)
- [Security Roadmap](./security-roadmap.md)
- [Codebase Summary](./codebase-summary.md)

---

Last updated: January 17, 2026
Next review: April 17, 2026
