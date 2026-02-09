import { Injectable, inject, NgZone, OnDestroy } from '@angular/core';
import { LoggerService } from '@core/services';

/**
 * Auth event types for cross-tab communication.
 */
export type AuthBroadcastEventType = 'AUTH_LOGOUT' | 'AUTH_LOGIN' | 'AUTH_REFRESH';

/**
 * Auth broadcast event payload.
 */
export interface AuthBroadcastEvent {
    type: AuthBroadcastEventType;
    timestamp: number;
}

/**
 * Service for synchronizing authentication state across browser tabs.
 * Uses BroadcastChannel API for cross-tab communication.
 *
 * Browser Support: All modern browsers (Chrome 54+, Firefox 38+, Safari 15.4+, Edge 79+)
 */
@Injectable({
    providedIn: 'root'
})
export class AuthBroadcastService implements OnDestroy {
    private readonly logger = inject(LoggerService);
    private readonly ngZone = inject(NgZone);

    private readonly CHANNEL_NAME = 'auth_channel';
    private channel: BroadcastChannel | null = null;

    // Callbacks for handling received events
    private onLogoutCallback: (() => void) | null = null;
    private onLoginCallback: (() => void) | null = null;

    constructor() {
        this.initChannel();
    }

    ngOnDestroy(): void {
        this.closeChannel();
    }

    /**
     * Initializes the BroadcastChannel for cross-tab communication.
     */
    private initChannel(): void {
        // Check browser support
        if (typeof BroadcastChannel === 'undefined') {
            this.logger.warn('BroadcastChannel not supported - tab sync disabled');
            return;
        }

        try {
            this.channel = new BroadcastChannel(this.CHANNEL_NAME);
            this.channel.onmessage = (event: MessageEvent<AuthBroadcastEvent>) => {
                this.handleMessage(event.data);
            };
        } catch (error) {
            this.logger.error('Failed to create BroadcastChannel', error);
        }
    }

    /**
     * Handles incoming messages from other tabs.
     */
    private handleMessage(event: AuthBroadcastEvent): void {
        // Run inside Angular zone to trigger change detection
        this.ngZone.run(() => {
            switch (event.type) {
                case 'AUTH_LOGOUT':
                    this.logger.info('Received logout event from another tab');
                    this.onLogoutCallback?.();
                    break;
                case 'AUTH_LOGIN':
                    this.logger.info('Received login event from another tab');
                    this.onLoginCallback?.();
                    break;
                case 'AUTH_REFRESH':
                    // Token refresh handled by each tab independently
                    break;
            }
        });
    }

    /**
     * Broadcasts a logout event to all other tabs.
     */
    broadcastLogout(): void {
        this.broadcast({ type: 'AUTH_LOGOUT', timestamp: Date.now() });
    }

    /**
     * Broadcasts a login event to all other tabs.
     */
    broadcastLogin(): void {
        this.broadcast({ type: 'AUTH_LOGIN', timestamp: Date.now() });
    }

    /**
     * Sends a message to all other tabs.
     */
    private broadcast(event: AuthBroadcastEvent): void {
        if (!this.channel) {
            return;
        }

        try {
            this.channel.postMessage(event);
        } catch (error) {
            this.logger.error('Failed to broadcast auth event', error);
        }
    }

    /**
     * Sets callback for logout events from other tabs.
     */
    onLogout(callback: () => void): void {
        this.onLogoutCallback = callback;
    }

    /**
     * Sets callback for login events from other tabs.
     */
    onLogin(callback: () => void): void {
        this.onLoginCallback = callback;
    }

    /**
     * Closes the BroadcastChannel.
     */
    private closeChannel(): void {
        if (this.channel) {
            this.channel.close();
            this.channel = null;
        }
    }
}
