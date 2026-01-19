// Locale-aware currency pipe that reacts to language changes
import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LanguageService } from '@core/i18n';

@Pipe({
    name: 'localizedCurrency',
    standalone: true,
    pure: false // Impure to react to language changes
})
export class LocalizedCurrencyPipe implements PipeTransform {
    private languageService = inject(LanguageService);

    transform(
        value: number | string | null | undefined,
        currencyCode?: string,
        display: 'code' | 'symbol' | 'symbol-narrow' = 'symbol',
        digitsInfo?: string
    ): string | null {
        if (value === null || value === undefined) {
            return null;
        }

        const locale = this.languageService.currentLang();

        // Use VND for Vietnamese, provided currencyCode (or USD) for English
        const code = locale === 'vi' ? 'VND' : currencyCode || 'USD';
        // VND has no decimal places; other currencies use provided or default format
        const digits = locale === 'vi' && code === 'VND' ? '1.0-0' : digitsInfo || '1.2-2';

        const currencyPipe = new CurrencyPipe(locale);
        return currencyPipe.transform(value, code, display, digits);
    }
}
