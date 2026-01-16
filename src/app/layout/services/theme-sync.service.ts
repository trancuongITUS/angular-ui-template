import { Injectable, effect, inject, Injector, runInInjectionContext, INJECTOR } from '@angular/core';
import { LayoutService } from './layout.service';

/**
 * Service to synchronize theme changes between AppStore and LayoutService.
 * This decouples the store from layout concerns while maintaining backward compatibility.
 */
@Injectable({ providedIn: 'root' })
export class ThemeSyncService {
    private readonly layoutService = inject(LayoutService);
    private readonly injector = inject(INJECTOR);
    private initialized = false;

    /**
     * Initialize theme synchronization with the store.
     * Call this from the app initialization to set up the effect.
     */
    initialize(getTheme: () => 'light' | 'dark'): void {
        if (this.initialized) return;
        this.initialized = true;

        runInInjectionContext(this.injector, () => {
            effect(() => {
                const theme = getTheme();
                this.syncThemeToLayout(theme);
            });
        });
    }

    /**
     * Sync theme to LayoutService.
     */
    syncThemeToLayout(theme: 'light' | 'dark'): void {
        const isDark = theme === 'dark';
        const currentIsDark = this.layoutService.layoutConfig().darkTheme;

        if (isDark !== currentIsDark) {
            this.layoutService.layoutConfig.update((config) => ({
                ...config,
                darkTheme: isDark
            }));
        }
    }

    /**
     * Get current layout theme state.
     */
    getLayoutTheme(): 'light' | 'dark' {
        return this.layoutService.layoutConfig().darkTheme ? 'dark' : 'light';
    }
}
