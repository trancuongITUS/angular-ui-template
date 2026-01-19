// Locale-aware date pipe that reacts to language changes
import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LanguageService } from '@core/i18n';

@Pipe({
    name: 'localizedDate',
    standalone: true,
    pure: false // Impure to react to language changes
})
export class LocalizedDatePipe implements PipeTransform {
    private languageService = inject(LanguageService);

    transform(value: Date | string | number | null | undefined, format: string = 'mediumDate'): string | null {
        if (value === null || value === undefined) {
            return null;
        }

        const locale = this.languageService.currentLang();
        const datePipe = new DatePipe(locale);
        return datePipe.transform(value, format);
    }
}
