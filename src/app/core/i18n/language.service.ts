// Language service with signal-based state management and localStorage persistence
import { inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export interface Language {
    code: string;
    name: string;
    flag: string;
    locale: string;
    currency: string;
}

export const AVAILABLE_LANGUAGES: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸', locale: 'en-US', currency: 'USD' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', locale: 'vi-VN', currency: 'VND' }
];

const STORAGE_KEY = 'app-language';
const DEFAULT_LANG = 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
    private translocoService = inject(TranslocoService);

    /** Available languages for the switcher - must be initialized before currentLang */
    readonly availableLanguages = AVAILABLE_LANGUAGES;

    /** Current active language code */
    currentLang = signal<string>(this.getInitialLanguage());

    constructor() {
        // Initialize Transloco with detected language
        const initialLang = this.getInitialLanguage();
        this.translocoService.setActiveLang(initialLang);
        this.currentLang.set(initialLang);
    }

    /** Get initial language from localStorage or browser settings */
    getInitialLanguage(): string {
        // 1. Check localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && this.isValidLanguage(saved)) {
            return saved;
        }

        // 2. Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (this.isValidLanguage(browserLang)) {
            return browserLang;
        }

        // 3. Default fallback
        return DEFAULT_LANG;
    }

    /** Change the active language */
    setLanguage(langCode: string): void {
        if (!this.isValidLanguage(langCode)) {
            console.warn(`Invalid language code: ${langCode}`);
            return;
        }

        localStorage.setItem(STORAGE_KEY, langCode);
        this.translocoService.setActiveLang(langCode);
        this.currentLang.set(langCode);
    }

    /** Get current language info */
    getCurrentLanguageInfo(): Language | undefined {
        return this.availableLanguages.find((l) => l.code === this.currentLang());
    }

    /** Check if language code is valid */
    private isValidLanguage(code: string): boolean {
        return this.availableLanguages.some((l) => l.code === code);
    }

    /** Get locale for current language */
    getCurrentLocale(): string {
        const lang = this.getCurrentLanguageInfo();
        return lang?.locale || 'en-US';
    }

    /** Get currency code for current language */
    getCurrentCurrency(): string {
        const lang = this.getCurrentLanguageInfo();
        return lang?.currency || 'USD';
    }
}
