import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject, throwError, of } from 'rxjs';
import { map, tap, catchError, switchMap, shareReplay, first, filter, take } from 'rxjs/operators';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { AuthBroadcastService } from './auth-broadcast.service';
import { LoginCredentials, AuthResponse, RefreshTokenResponse, PasswordResetRequest, PasswordResetConfirmation, RegistrationData } from '../models/auth.model';
import { User } from '../models/user.model';

/**
 * Authentication service that handles login, logout, token refresh, and user authentication state.
 * Uses modern Angular patterns with signals and functional dependency injection.
 * Integrates with AuthBroadcastService for cross-tab synchronization.
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly tokenService = inject(TokenService);
    private readonly sessionService = inject(SessionService);
    private readonly authBroadcast = inject(AuthBroadcastService);

    // Authentication endpoints
    private readonly AUTH_ENDPOINTS = {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        LOGOUT_ALL: '/auth/logout-all',
        REFRESH: '/auth/refresh',
        PROFILE: '/auth/profile',
        REGISTER: '/auth/register',
        PASSWORD_RESET: '/auth/password-reset',
        PASSWORD_RESET_CONFIRM: '/auth/password-reset-confirm',
        CHANGE_PASSWORD: '/auth/change-password'
    };

    // Loading state - using Signals for Angular 20 best practices
    private readonly loadingSignal = signal<boolean>(false);
    readonly loading = this.loadingSignal.asReadonly();

    // Error state - using Signals for Angular 20 best practices
    private readonly errorSignal = signal<string | null>(null);
    readonly error = this.errorSignal.asReadonly();

    // Authentication state (delegated to SessionService)
    readonly isAuthenticated = this.sessionService.isAuthenticated;
    readonly isInitializing = this.sessionService.isInitializing;
    readonly currentUser = this.sessionService.user;
    readonly userProfile = this.sessionService.userProfile;

    // Token refresh - using Subject for async coordination (Observable pattern still needed for HTTP)
    private refreshTokenInProgress = false;
    private refreshTokenSubject = new Subject<string | null>();

    constructor() {
        this.setupBroadcastListeners();
        this.initializeAuth();
    }

    /**
     * Sets up listeners for auth events from other tabs.
     */
    private setupBroadcastListeners(): void {
        // When another tab logs out, clear local state
        this.authBroadcast.onLogout(() => {
            this.clearAuthState();
            this.router.navigate(['/auth/login']);
        });

        // When another tab logs in, attempt to restore session
        this.authBroadcast.onLogin(() => {
            if (!this.sessionService.isAuthenticated()) {
                this.restoreSession();
            }
        });
    }

    /**
     * Initializes authentication by checking for refresh token and restoring session.
     * With memory-based storage, we always need to restore session on page load.
     */
    private initializeAuth(): void {
        const hasRefreshToken = this.tokenService.hasRefreshToken();

        if (hasRefreshToken) {
            this.sessionService.setInitializing(true);
            this.restoreSession();
        }
    }

    /**
     * Restores session by refreshing the access token and fetching user profile.
     */
    private restoreSession(): void {
        this.refreshToken()
            .pipe(
                switchMap(() => this.fetchProfile()),
                first()
            )
            .subscribe({
                next: (user) => {
                    this.sessionService.setUser(user);
                    this.sessionService.setInitializing(false);
                },
                error: () => {
                    this.clearAuthState();
                    this.sessionService.setInitializing(false);
                }
            });
    }

    /**
     * Fetches user profile from the server.
     */
    fetchProfile(): Observable<User> {
        return this.http.get<{ data: User }>(this.AUTH_ENDPOINTS.PROFILE).pipe(map((response) => response.data));
    }

    /**
     * Authenticates a user with email and password.
     */
    login(credentials: LoginCredentials): Observable<AuthResponse> {
        this.setLoading(true);
        this.clearError();

        return this.http.post<{ data: AuthResponse }>(this.AUTH_ENDPOINTS.LOGIN, credentials).pipe(
            map((response) => response.data),
            tap((response) => {
                this.handleAuthSuccess(response);
                this.authBroadcast.broadcastLogin();
            }),
            catchError((error) => this.handleError('Login failed', error)),
            tap(() => this.setLoading(false))
        );
    }

    /**
     * Registers a new user.
     */
    register(data: RegistrationData): Observable<AuthResponse> {
        this.setLoading(true);
        this.clearError();

        return this.http.post<{ data: AuthResponse }>(this.AUTH_ENDPOINTS.REGISTER, data).pipe(
            map((response) => response.data),
            tap((response) => {
                this.handleAuthSuccess(response);
                this.authBroadcast.broadcastLogin();
            }),
            catchError((error) => this.handleError('Registration failed', error)),
            tap(() => this.setLoading(false))
        );
    }

    /**
     * Logs out the current user.
     */
    logout(): Observable<void> {
        this.setLoading(true);
        const refreshToken = this.tokenService.getRefreshToken();

        // Backend expects refresh token in body for session revocation
        const body = refreshToken ? { refreshToken } : {};

        return this.http.post<void>(this.AUTH_ENDPOINTS.LOGOUT, body).pipe(
            catchError(() => of(void 0)), // Ignore errors on logout
            tap(() => {
                this.authBroadcast.broadcastLogout();
                this.clearAuthState();
                this.router.navigate(['/auth/login']);
            }),
            tap(() => this.setLoading(false))
        );
    }

    /**
     * Logs out from all devices.
     */
    logoutAll(): Observable<void> {
        this.setLoading(true);

        return this.http.post<void>(this.AUTH_ENDPOINTS.LOGOUT_ALL, {}).pipe(
            catchError(() => of(void 0)),
            tap(() => {
                this.authBroadcast.broadcastLogout();
                this.clearAuthState();
                this.router.navigate(['/auth/login']);
            }),
            tap(() => this.setLoading(false))
        );
    }

    /**
     * Logs out the user locally without calling the backend.
     */
    logoutLocal(): void {
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
    }

    /**
     * Refreshes the access token using the refresh token.
     */
    refreshToken(): Observable<string> {
        // If refresh is already in progress, wait for it to complete
        if (this.refreshTokenInProgress) {
            return this.refreshTokenSubject.asObservable().pipe(
                filter((token): token is string => token !== null),
                take(1)
            );
        }

        const refreshToken = this.tokenService.getRefreshToken();
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token available'));
        }

        this.refreshTokenInProgress = true;

        return this.http.post<{ data: RefreshTokenResponse }>(this.AUTH_ENDPOINTS.REFRESH, { refreshToken }).pipe(
            map((response) => response.data),
            tap((data) => {
                this.tokenService.setAccessToken(data.accessToken);
                this.tokenService.setRefreshToken(data.refreshToken);
                this.refreshTokenSubject.next(data.accessToken);
            }),
            map((data) => data.accessToken),
            catchError((error) => {
                this.refreshTokenSubject.next(null);
                this.clearAuthState();
                return throwError(() => error);
            }),
            tap(() => {
                this.refreshTokenInProgress = false;
            }),
            shareReplay(1)
        );
    }

    /**
     * Initiates password reset process.
     */
    requestPasswordReset(request: PasswordResetRequest): Observable<void> {
        this.setLoading(true);
        this.clearError();

        return this.http.post<void>(this.AUTH_ENDPOINTS.PASSWORD_RESET, request).pipe(
            catchError((error) => this.handleError('Password reset request failed', error)),
            tap(() => this.setLoading(false))
        );
    }

    /**
     * Confirms password reset with new password.
     */
    confirmPasswordReset(confirmation: PasswordResetConfirmation): Observable<void> {
        this.setLoading(true);
        this.clearError();

        return this.http.post<void>(this.AUTH_ENDPOINTS.PASSWORD_RESET_CONFIRM, confirmation).pipe(
            catchError((error) => this.handleError('Password reset confirmation failed', error)),
            tap(() => this.setLoading(false))
        );
    }

    /**
     * Checks if the user has a specific role.
     */
    hasRole(role: string): boolean {
        return this.sessionService.hasRole(role);
    }

    /**
     * Checks if the user has any of the specified roles.
     */
    hasAnyRole(roles: string[]): boolean {
        return this.sessionService.hasAnyRole(roles);
    }

    /**
     * Checks if the user has all of the specified roles.
     */
    hasAllRoles(roles: string[]): boolean {
        return this.sessionService.hasAllRoles(roles);
    }

    /**
     * Checks if the user has a specific permission.
     */
    hasPermission(permission: string): boolean {
        return this.sessionService.hasPermission(permission);
    }

    /**
     * Handles successful authentication response.
     */
    private handleAuthSuccess(response: AuthResponse): void {
        this.tokenService.setAccessToken(response.accessToken);
        this.tokenService.setRefreshToken(response.refreshToken);
        this.sessionService.setUser(response.user);
        this.clearError();
    }

    /**
     * Clears all authentication state.
     */
    private clearAuthState(): void {
        this.tokenService.clearTokens();
        this.sessionService.clearSession();
    }

    /**
     * Sets loading state using signal.
     */
    private setLoading(loading: boolean): void {
        this.loadingSignal.set(loading);
    }

    /**
     * Sets error message using signal.
     */
    private setError(error: string): void {
        this.errorSignal.set(error);
    }

    /**
     * Clears error message using signal.
     */
    private clearError(): void {
        this.errorSignal.set(null);
    }

    /**
     * Generic error handler.
     */
    private handleError(message: string, error: unknown): Observable<never> {
        const errorMessage = this.extractErrorMessage(error);
        this.setError(`${message}: ${errorMessage}`);
        this.setLoading(false);
        return throwError(() => error);
    }

    /**
     * Extracts error message from error object.
     */
    private extractErrorMessage(error: unknown): string {
        if (typeof error === 'string') {
            return error;
        }

        if (error && typeof error === 'object') {
            const err = error as { error?: { message?: string }; message?: string };
            return err.error?.message || err.message || 'Unknown error occurred';
        }

        return 'Unknown error occurred';
    }
}
