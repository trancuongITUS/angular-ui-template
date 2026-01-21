import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { LoggerService } from '@core/services';
import { User, UserRole } from '../models/user.model';

/**
 * Helper to create a mock user
 */
function createMockUser(overrides: Partial<User> = {}): User {
    return {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        roles: [UserRole.USER],
        permissions: ['read'],
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides
    };
}

describe('SessionService', () => {
    let service: SessionService;
    let mockLoggerService: jasmine.SpyObj<LoggerService>;

    beforeEach(() => {
        mockLoggerService = jasmine.createSpyObj('LoggerService', ['error', 'warn', 'info', 'debug']);

        TestBed.configureTestingModule({
            providers: [SessionService, { provide: LoggerService, useValue: mockLoggerService }]
        });

        service = TestBed.inject(SessionService);
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('User Storage', () => {
        it('should store user in memory only', () => {
            const user = createMockUser();
            service.setUser(user);

            expect(service.getCurrentUser()).toEqual(user);
            expect(localStorage.getItem('user_session')).toBeNull();
        });

        it('should return null when no user set', () => {
            expect(service.getCurrentUser()).toBeNull();
        });

        it('should update authentication state when user is set', () => {
            expect(service.isAuthenticated()).toBeFalse();
            service.setUser(createMockUser());
            expect(service.isAuthenticated()).toBeTrue();
        });

        it('should clear authentication state when user set to null', () => {
            service.setUser(createMockUser());
            expect(service.isAuthenticated()).toBeTrue();
            service.setUser(null);
            expect(service.isAuthenticated()).toBeFalse();
        });
    });

    describe('Clear Session', () => {
        it('should clear user from memory', () => {
            service.setUser(createMockUser());
            service.clearSession();

            expect(service.getCurrentUser()).toBeNull();
            expect(service.isAuthenticated()).toBeFalse();
        });

        it('should not affect localStorage', () => {
            // Manually set something in localStorage to verify we don't touch it
            localStorage.setItem('other_data', 'test');
            service.setUser(createMockUser());
            service.clearSession();

            expect(localStorage.getItem('other_data')).toBe('test');
            expect(localStorage.getItem('user_session')).toBeNull();
        });
    });

    describe('Initialization State', () => {
        it('should track initialization state', () => {
            expect(service.isInitializing()).toBeFalse();
            service.setInitializing(true);
            expect(service.isInitializing()).toBeTrue();
            service.setInitializing(false);
            expect(service.isInitializing()).toBeFalse();
        });
    });

    describe('Computed Properties', () => {
        it('should compute userProfile from user', () => {
            const user = createMockUser({
                id: 'user-123',
                email: 'profile@test.com',
                firstName: 'Jane',
                lastName: 'Smith'
            });
            service.setUser(user);

            const profile = service.userProfile();
            expect(profile?.id).toBe('user-123');
            expect(profile?.email).toBe('profile@test.com');
            expect(profile?.firstName).toBe('Jane');
            expect(profile?.lastName).toBe('Smith');
        });

        it('should return null userProfile when no user', () => {
            expect(service.userProfile()).toBeNull();
        });

        it('should compute userRoles from user', () => {
            const user = createMockUser({ roles: [UserRole.ADMIN, UserRole.MANAGER] });
            service.setUser(user);
            expect(service.userRoles()).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
        });

        it('should return empty roles when no user', () => {
            expect(service.userRoles()).toEqual([]);
        });

        it('should compute userId from user', () => {
            const user = createMockUser({ id: 'user-xyz' });
            service.setUser(user);
            expect(service.userId()).toBe('user-xyz');
        });

        it('should return null userId when no user', () => {
            expect(service.userId()).toBeNull();
        });

        it('should compute userEmail from user', () => {
            const user = createMockUser({ email: 'email@test.com' });
            service.setUser(user);
            expect(service.userEmail()).toBe('email@test.com');
        });

        it('should return null userEmail when no user', () => {
            expect(service.userEmail()).toBeNull();
        });
    });

    describe('Role Checking', () => {
        it('should check if user has specific role', () => {
            const user = createMockUser({ roles: [UserRole.ADMIN, UserRole.USER] });
            service.setUser(user);

            expect(service.hasRole(UserRole.ADMIN)).toBeTrue();
            expect(service.hasRole(UserRole.USER)).toBeTrue();
            expect(service.hasRole(UserRole.MANAGER)).toBeFalse();
        });

        it('should check if user has any of specified roles', () => {
            const user = createMockUser({ roles: [UserRole.USER] });
            service.setUser(user);

            expect(service.hasAnyRole([UserRole.ADMIN, UserRole.USER])).toBeTrue();
            expect(service.hasAnyRole([UserRole.ADMIN, UserRole.MANAGER])).toBeFalse();
        });

        it('should check if user has all specified roles', () => {
            const user = createMockUser({ roles: [UserRole.ADMIN, UserRole.USER, UserRole.MANAGER] });
            service.setUser(user);

            expect(service.hasAllRoles([UserRole.ADMIN, UserRole.USER])).toBeTrue();
            expect(service.hasAllRoles([UserRole.ADMIN, UserRole.EMPLOYEE])).toBeFalse();
        });
    });

    describe('Permission Checking', () => {
        it('should check if user has specific permission', () => {
            const user = createMockUser({ permissions: ['read', 'write'] });
            service.setUser(user);

            expect(service.hasPermission('read')).toBeTrue();
            expect(service.hasPermission('delete')).toBeFalse();
        });

        it('should return false when no user', () => {
            expect(service.hasPermission('read')).toBeFalse();
        });
    });

    describe('Update User', () => {
        it('should update specific user properties', () => {
            const user = createMockUser({ firstName: 'John' });
            service.setUser(user);

            service.updateUser({ firstName: 'Jane' });

            expect(service.getCurrentUser()?.firstName).toBe('Jane');
        });

        it('should not update when no user', () => {
            service.updateUser({ firstName: 'Jane' });
            expect(service.getCurrentUser()).toBeNull();
        });
    });
});
