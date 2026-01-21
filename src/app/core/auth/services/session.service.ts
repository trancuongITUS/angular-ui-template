import { Injectable, signal, computed, inject } from '@angular/core';
import { User, UserProfile } from '../models/user.model';
import { LoggerService } from '@core/services';

/**
 * Service for managing user session state.
 * Uses Angular Signals for reactive state management.
 * User data is stored in memory only (signals) - NOT persisted to storage.
 * Session restoration happens via AuthService.initializeAuth() using refresh token.
 */
@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private readonly logger = inject(LoggerService);

    // Signals for reactive state management (memory-only)
    private readonly userSignal = signal<User | null>(null);
    private readonly isAuthenticatedSignal = signal<boolean>(false);
    private readonly isInitializingSignal = signal<boolean>(false);

    // Public computed signals
    readonly user = this.userSignal.asReadonly();
    readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
    readonly isInitializing = this.isInitializingSignal.asReadonly();

    // Derived computed properties
    readonly userProfile = computed<UserProfile | null>(() => {
        const user = this.userSignal();
        if (!user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName || `${user.firstName} ${user.lastName}`,
            avatar: user.avatar,
            roles: user.roles
        };
    });

    readonly userRoles = computed<string[]>(() => {
        const user = this.userSignal();
        return user?.roles ?? [];
    });

    readonly userId = computed<string | null>(() => {
        const user = this.userSignal();
        return user?.id ?? null;
    });

    readonly userEmail = computed<string | null>(() => {
        const user = this.userSignal();
        return user?.email ?? null;
    });

    /**
     * Sets the current user and updates authentication state.
     * User data is stored in memory only (signal) - NOT persisted.
     */
    setUser(user: User | null): void {
        this.userSignal.set(user);
        this.isAuthenticatedSignal.set(!!user);
    }

    /**
     * Gets the current user snapshot (non-reactive).
     */
    getCurrentUser(): User | null {
        return this.userSignal();
    }

    /**
     * Checks if the user has a specific role.
     */
    hasRole(role: string): boolean {
        const roles = this.userRoles();
        return roles.includes(role);
    }

    /**
     * Checks if the user has any of the specified roles.
     */
    hasAnyRole(roles: string[]): boolean {
        const userRoles = this.userRoles();
        return roles.some((role) => userRoles.includes(role));
    }

    /**
     * Checks if the user has all of the specified roles.
     */
    hasAllRoles(roles: string[]): boolean {
        const userRoles = this.userRoles();
        return roles.every((role) => userRoles.includes(role));
    }

    /**
     * Checks if the user has a specific permission.
     */
    hasPermission(permission: string): boolean {
        const user = this.userSignal();
        return user?.permissions?.includes(permission) ?? false;
    }

    /**
     * Clears the current session from memory.
     */
    clearSession(): void {
        this.userSignal.set(null);
        this.isAuthenticatedSignal.set(false);
    }

    /**
     * Sets initialization state (used during session restore).
     */
    setInitializing(initializing: boolean): void {
        this.isInitializingSignal.set(initializing);
    }

    /**
     * Updates specific user properties.
     */
    updateUser(updates: Partial<User>): void {
        const currentUser = this.userSignal();
        if (!currentUser) {
            return;
        }

        const updatedUser = { ...currentUser, ...updates };
        this.setUser(updatedUser);
    }
}
