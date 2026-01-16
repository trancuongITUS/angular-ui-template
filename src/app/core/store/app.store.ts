import { patchState, signalStore, withMethods, withState, withComputed } from '@ngrx/signals';
import { computed } from '@angular/core';

export type Theme = 'light' | 'dark';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface AppState {
    theme: Theme;
    user: User | null;
    loading: boolean;
}

const initialState: AppState = {
    theme: 'light',
    user: null,
    loading: false
};

/**
 * Global application state store using NgRx Signals.
 * Theme synchronization with LayoutService is handled by ThemeSyncService.
 */
export const AppStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed(({ theme, user }) => ({
        isDarkTheme: computed(() => theme() === 'dark'),
        isAuthenticated: computed(() => !!user())
    })),
    withMethods((store) => ({
        setTheme(theme: Theme) {
            patchState(store, { theme });
        },
        toggleTheme() {
            const newTheme = store.theme() === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        },
        setUser(user: User | null) {
            patchState(store, { user });
        },
        setLoading(loading: boolean) {
            patchState(store, { loading });
        }
    }))
);
