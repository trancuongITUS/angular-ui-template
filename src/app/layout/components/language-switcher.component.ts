// Language switcher dropdown component for topbar integration
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select, SelectChangeEvent } from 'primeng/select';
import { LanguageService, Language, AVAILABLE_LANGUAGES } from '@core/i18n';

@Component({
    selector: 'app-language-switcher',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule, Select],
    template: `
        <p-select
            [options]="languages"
            [(ngModel)]="selectedLang"
            (onChange)="onLanguageChange($event)"
            optionLabel="name"
            optionValue="code"
            styleClass="language-dropdown"
            [showClear]="false"
            appendTo="body"
        >
            <ng-template pTemplate="selectedItem">
                <div class="flex items-center gap-2" *ngIf="selectedLangInfo">
                    <span class="text-lg">{{ selectedLangInfo.flag }}</span>
                    <span class="hidden sm:inline">{{ selectedLangInfo.name }}</span>
                </div>
            </ng-template>
            <ng-template pTemplate="item" let-lang>
                <div class="flex items-center gap-2">
                    <span class="text-lg">{{ lang.flag }}</span>
                    <span>{{ lang.name }}</span>
                </div>
            </ng-template>
        </p-select>
    `,
    styles: [
        `
            :host {
                display: inline-flex;
                align-items: center;
            }

            :host ::ng-deep .language-dropdown {
                border: none;
                background: transparent;

                .p-select-label {
                    padding: 0.5rem;
                }

                .p-select-dropdown {
                    width: 1.5rem;
                }
            }
        `
    ]
})
export class LanguageSwitcherComponent {
    private languageService = inject(LanguageService);

    languages: Language[] = AVAILABLE_LANGUAGES;
    selectedLang = this.languageService.currentLang();

    get selectedLangInfo(): Language | undefined {
        return this.languageService.getCurrentLanguageInfo();
    }

    onLanguageChange(event: SelectChangeEvent): void {
        this.languageService.setLanguage(event.value);
    }
}
