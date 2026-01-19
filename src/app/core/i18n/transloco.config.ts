// Transloco configuration provider
import { isDevMode } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './transloco-loader';

export const provideTranslocoConfig = () =>
    provideTransloco({
        config: {
            availableLangs: ['en', 'vi'],
            defaultLang: 'en',
            fallbackLang: 'en',
            reRenderOnLangChange: true,
            prodMode: !isDevMode(),
            missingHandler: {
                useFallbackTranslation: true,
                logMissingKey: true
            }
        },
        loader: TranslocoHttpLoader
    });
