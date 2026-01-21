# Security Roadmap

Authentication security enhancement plan following OWASP guidelines.

## Current State (Phase 1 - Complete)

### Initial Implementation (v20.0.0)
- [x] JWT tokens stored in localStorage (XSS vulnerable - documented)
- [x] CSP headers configured in `src/environments/security-headers.ts`
- [x] Security warnings documented in `TokenService`
- [x] AuthService memory leak fixed (subscription cleanup)

### Security Hardening (v20.0.1)
- [x] Authorization directives with actual role/permission verification
- [x] Real-time reactive checks tied to authentication state
- [x] Comprehensive test coverage (11 tests for authorization layer)
- [x] Memory leak fixes in layout components (takeUntil pattern)
- [x] Documented client-side limitations and backend verification requirements

### Token Storage Security Migration (v20.5.1)
- [x] **Access Token**: Migrated from localStorage to memory (signal-based)
  - Lost on page refresh (forces token refresh via AuthService)
  - Inaccessible via DevTools Application tab
  - Protected from XSS attacks requiring script execution
- [x] **Refresh Token**: Migrated from localStorage to sessionStorage
  - Cleared automatically on tab close
  - Survives page refresh (enables session recovery)
  - Still vulnerable to XSS but requires active script execution
- [x] **Token Expiry**: Removed localStorage persistence, decoded from JWT payload
  - Expiration check with 30-second buffer for graceful refresh
  - Uses HS256 exp claim from JWT payload
- [x] **Error Handling**: Comprehensive try-catch for sessionStorage operations
  - Graceful degradation if storage unavailable
  - Logged errors for debugging
  - Clear token fallback on storage failure

### Migration Impact
- **Breaking Change**: Users must re-login after deployment
  - Old localStorage tokens automatically ignored
  - AuthService handles token refresh on first protected request
- **Session Isolation**: No cross-tab token sharing by default
  - Each tab maintains independent session via sessionStorage
  - Improves security by limiting token exposure scope
- **Page Refresh**: Requires token refresh implementation (Phase 4)
  - Access token lost on refresh
  - SessionService retrieves refresh token from sessionStorage
  - AuthService exchanges for new access token

### Known Risks
- **XSS Attack Surface**: sessionStorage tokens accessible to injected scripts
- **Mitigation**: CSP headers + signal-based access tokens
- **Session Loss**: Clearing sessionStorage clears refresh token (expected behavior)

## Phase 2 (Next Sprint)

### Token Storage Migration
- [ ] Migrate from localStorage to httpOnly cookies
- [ ] Implement `SameSite=Strict` cookie attribute
- [ ] Update auth interceptor for cookie-based auth
- [ ] Backend API changes for cookie handling

### Token Rotation
- [ ] Implement short-lived access tokens (15min)
- [ ] Implement refresh token rotation
- [ ] Configure absolute session timeout (7 days)
- [ ] Add token revocation endpoint

### CSP Hardening
- [ ] Remove `unsafe-inline` from script-src
- [ ] Implement CSP nonces for inline scripts
- [ ] Add Content-Security-Policy-Report-Only header for testing

## Phase 3 (Production Hardening)

### Security Audit
- [ ] Conduct internal security review
- [ ] Schedule penetration testing
- [ ] OWASP compliance verification
- [ ] Document security architecture

### Additional Security Measures
- [ ] Implement rate limiting on auth endpoints
- [ ] Add brute force protection
- [ ] Configure account lockout policy
- [ ] Add audit logging for auth events

## Defense Layers

| Layer | Status | Protection |
|-------|--------|------------|
| 1. CSP Headers | ✅ Complete | Block inline scripts |
| 2. httpOnly Cookies | ⏳ Phase 2 | Prevent JS token access |
| 3. Token Rotation | ⏳ Phase 2 | Limit exposure window |
| 4. Security Audit | ⏳ Phase 3 | Full compliance |

## References

- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [MDN Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
