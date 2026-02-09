import { Injectable, inject, signal } from '@angular/core';
import { JwtPayload } from '../models/auth.model';
import { LoggerService } from '@core/services';

/**
 * Service for managing JWT tokens with secure storage strategy.
 * - Access token: stored in memory (signal) - lost on page refresh, protected from XSS
 * - Refresh token: stored in sessionStorage - cleared on tab close, survives refresh
 *
 * Security improvements over localStorage:
 * - Access tokens not accessible via DevTools Application tab
 * - Session isolation per tab (no cross-tab token sharing by default)
 * - Automatic cleanup on tab close
 *
 * @see docs/security-roadmap.md for full security documentation
 */
@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private readonly logger = inject(LoggerService);

    /** Storage key for refresh token in sessionStorage */
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';

    /** Access token stored in memory via signal - NOT persisted, protected from XSS */
    private readonly accessTokenSignal = signal<string | null>(null);

    /**
     * Stores access token in memory (signal).
     * Token will be lost on page refresh - use refresh token to restore.
     */
    setAccessToken(token: string): void {
        if (token) {
            this.accessTokenSignal.set(token);
        }
    }

    /**
     * Retrieves access token from memory.
     */
    getAccessToken(): string | null {
        return this.accessTokenSignal();
    }

    /**
     * Stores refresh token in sessionStorage.
     * Cleared when tab closes, survives page refresh.
     */
    setRefreshToken(token: string): void {
        if (token) {
            try {
                sessionStorage.setItem(this.REFRESH_TOKEN_KEY, token);
            } catch (error) {
                this.logger.error('Refresh token storage failed', error);
            }
        }
    }

    /**
     * Retrieves refresh token from sessionStorage.
     */
    getRefreshToken(): string | null {
        try {
            return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
        } catch (error) {
            this.logger.error('Refresh token retrieval failed', error);
            return null;
        }
    }

    /**
     * Clears all tokens (memory signal + sessionStorage).
     */
    clearTokens(): void {
        this.accessTokenSignal.set(null);
        try {
            sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
        } catch (error) {
            this.logger.error('Token clear failed', error);
        }
    }

    /**
     * Checks if access token exists in memory.
     */
    hasToken(): boolean {
        return !!this.accessTokenSignal();
    }

    /**
     * Checks if refresh token exists in sessionStorage.
     */
    hasRefreshToken(): boolean {
        return !!this.getRefreshToken();
    }

    /**
     * Checks if the access token is expired.
     */
    isTokenExpired(): boolean {
        const token = this.getAccessToken();
        if (!token) {
            return true;
        }

        const payload = this.decodeToken(token);
        if (!payload?.exp) {
            return true;
        }

        // Check if token is expired (with 30 second buffer)
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const bufferTime = 30 * 1000; // 30 seconds buffer

        return currentTime >= expirationTime - bufferTime;
    }

    /**
     * Checks if the token is valid (exists and not expired).
     */
    isTokenValid(): boolean {
        return this.hasToken() && !this.isTokenExpired();
    }

    /**
     * Decodes a JWT token without verification.
     * Note: This should only be used for reading token data, not for validation.
     */
    decodeToken(token: string): JwtPayload | null {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }

            const payload = parts[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded) as JwtPayload;
        } catch (error) {
            this.logger.error('Token decode failed', error);
            return null;
        }
    }

    /**
     * Gets the user ID from the token payload.
     */
    getUserIdFromToken(): string | null {
        const token = this.getAccessToken();
        if (!token) {
            return null;
        }

        const payload = this.decodeToken(token);
        return payload?.sub ?? null;
    }

    /**
     * Gets the user roles from the token payload.
     */
    getUserRolesFromToken(): string[] {
        const token = this.getAccessToken();
        if (!token) {
            return [];
        }

        const payload = this.decodeToken(token);
        return payload?.roles ?? [];
    }

    /**
     * Gets the token expiration time in milliseconds.
     */
    getTokenExpiration(): number | null {
        const token = this.getAccessToken();
        if (!token) {
            return null;
        }

        const payload = this.decodeToken(token);
        if (!payload?.exp) {
            return null;
        }

        return payload.exp * 1000; // Convert to milliseconds
    }

    /**
     * Gets the time remaining until token expiration in seconds.
     */
    getTimeUntilExpiration(): number {
        const expiration = this.getTokenExpiration();
        if (!expiration) {
            return 0;
        }

        const timeRemaining = Math.floor((expiration - Date.now()) / 1000);
        return Math.max(0, timeRemaining);
    }
}
