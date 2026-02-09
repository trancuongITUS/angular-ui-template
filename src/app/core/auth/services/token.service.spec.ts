import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';
import { LoggerService } from '@core/services';

/**
 * Helper to create a mock JWT token
 */
function createMockJwt(payload: { sub?: string; exp?: number; roles?: string[] }): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = 'mock-signature';
    return `${header}.${body}.${signature}`;
}

function futureTimestamp(seconds = 3600): number {
    return Math.floor(Date.now() / 1000) + seconds;
}

function pastTimestamp(seconds = 3600): number {
    return Math.floor(Date.now() / 1000) - seconds;
}

describe('TokenService', () => {
    let service: TokenService;
    let mockLoggerService: jasmine.SpyObj<LoggerService>;

    beforeEach(() => {
        mockLoggerService = jasmine.createSpyObj('LoggerService', ['error', 'warn', 'info', 'debug']);

        TestBed.configureTestingModule({
            providers: [TokenService, { provide: LoggerService, useValue: mockLoggerService }]
        });

        service = TestBed.inject(TokenService);
        sessionStorage.clear();
        localStorage.clear();
    });

    afterEach(() => {
        sessionStorage.clear();
        localStorage.clear();
    });

    describe('Access Token (Memory)', () => {
        it('should store access token in memory', () => {
            service.setAccessToken('test-token');
            expect(service.getAccessToken()).toBe('test-token');
            expect(localStorage.getItem('access_token')).toBeNull();
        });

        it('should return null when no token set', () => {
            expect(service.getAccessToken()).toBeNull();
        });

        it('should clear access token', () => {
            service.setAccessToken('test-token');
            service.clearTokens();
            expect(service.getAccessToken()).toBeNull();
        });

        it('should not set empty/null token', () => {
            service.setAccessToken('');
            expect(service.getAccessToken()).toBeNull();
        });

        it('should report hasToken correctly', () => {
            expect(service.hasToken()).toBeFalse();
            service.setAccessToken('test-token');
            expect(service.hasToken()).toBeTrue();
        });
    });

    describe('Refresh Token (sessionStorage)', () => {
        it('should store refresh token in sessionStorage', () => {
            service.setRefreshToken('refresh-token');
            expect(service.getRefreshToken()).toBe('refresh-token');
            expect(sessionStorage.getItem('refresh_token')).toBe('refresh-token');
        });

        it('should not store in localStorage', () => {
            service.setRefreshToken('refresh-token');
            expect(localStorage.getItem('refresh_token')).toBeNull();
        });

        it('should clear refresh token', () => {
            service.setRefreshToken('refresh-token');
            service.clearTokens();
            expect(service.getRefreshToken()).toBeNull();
            expect(sessionStorage.getItem('refresh_token')).toBeNull();
        });

        it('should check for refresh token existence', () => {
            expect(service.hasRefreshToken()).toBeFalse();
            service.setRefreshToken('refresh-token');
            expect(service.hasRefreshToken()).toBeTrue();
        });

        it('should not set empty refresh token', () => {
            service.setRefreshToken('');
            expect(service.getRefreshToken()).toBeNull();
        });
    });

    describe('Token Validation', () => {
        it('should decode valid JWT', () => {
            const token = createMockJwt({ sub: 'user-1', exp: futureTimestamp() });
            service.setAccessToken(token);
            expect(service.isTokenValid()).toBeTrue();
        });

        it('should detect expired token', () => {
            const token = createMockJwt({ sub: 'user-1', exp: pastTimestamp() });
            service.setAccessToken(token);
            expect(service.isTokenExpired()).toBeTrue();
            expect(service.isTokenValid()).toBeFalse();
        });

        it('should return true for expired when no token', () => {
            expect(service.isTokenExpired()).toBeTrue();
        });

        it('should get user ID from token', () => {
            const token = createMockJwt({ sub: 'user-123', exp: futureTimestamp() });
            service.setAccessToken(token);
            expect(service.getUserIdFromToken()).toBe('user-123');
        });

        it('should get user roles from token', () => {
            const token = createMockJwt({ sub: 'user-1', exp: futureTimestamp(), roles: ['ADMIN', 'USER'] });
            service.setAccessToken(token);
            expect(service.getUserRolesFromToken()).toEqual(['ADMIN', 'USER']);
        });

        it('should return empty roles when no roles in token', () => {
            const token = createMockJwt({ sub: 'user-1', exp: futureTimestamp() });
            service.setAccessToken(token);
            expect(service.getUserRolesFromToken()).toEqual([]);
        });

        it('should return null for user ID when no token', () => {
            expect(service.getUserIdFromToken()).toBeNull();
        });
    });

    describe('Token Expiration', () => {
        it('should get token expiration time', () => {
            const exp = futureTimestamp(3600);
            const token = createMockJwt({ sub: 'user-1', exp });
            service.setAccessToken(token);
            expect(service.getTokenExpiration()).toBe(exp * 1000);
        });

        it('should return null expiration when no token', () => {
            expect(service.getTokenExpiration()).toBeNull();
        });

        it('should get time until expiration', () => {
            const exp = futureTimestamp(3600);
            const token = createMockJwt({ sub: 'user-1', exp });
            service.setAccessToken(token);
            const timeRemaining = service.getTimeUntilExpiration();
            // Should be approximately 3600 seconds (allow 5 second margin)
            expect(timeRemaining).toBeGreaterThan(3595);
            expect(timeRemaining).toBeLessThanOrEqual(3600);
        });

        it('should return 0 when token expired', () => {
            const token = createMockJwt({ sub: 'user-1', exp: pastTimestamp() });
            service.setAccessToken(token);
            expect(service.getTimeUntilExpiration()).toBe(0);
        });
    });

    describe('Token Decode', () => {
        it('should return null for invalid token format', () => {
            expect(service.decodeToken('invalid')).toBeNull();
            expect(service.decodeToken('a.b')).toBeNull();
            expect(service.decodeToken('')).toBeNull();
        });

        it('should decode valid token', () => {
            const token = createMockJwt({ sub: 'user-1', exp: 12345 });
            const decoded = service.decodeToken(token);
            expect(decoded?.sub).toBe('user-1');
            expect(decoded?.exp).toBe(12345);
        });
    });
});
