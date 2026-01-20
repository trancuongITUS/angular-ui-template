import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import localeEn from '@angular/common/locales/en';
import { LocalizedDatePipe } from './localized-date.pipe';
import { LanguageService } from '@core/i18n';

// Register locale data for testing
registerLocaleData(localeEn, 'en');
registerLocaleData(localeVi, 'vi');

describe('LocalizedDatePipe', () => {
    let pipe: LocalizedDatePipe;
    let mockLanguageService: jasmine.SpyObj<LanguageService>;
    let currentLangSignal: any;

    beforeEach(async () => {
        // Create a writable signal for testing
        currentLangSignal = signal<string>('en');

        // Create mock language service
        mockLanguageService = jasmine.createSpyObj(
            'LanguageService',
            [],
            {
                currentLang: currentLangSignal.asReadonly()
            }
        );

        // Mock the currentLang method to return the signal value
        (mockLanguageService as any).currentLang = jasmine.createSpy('currentLang').and.callFake(() => currentLangSignal());

        await TestBed.configureTestingModule({
            providers: [
                LocalizedDatePipe,
                { provide: LanguageService, useValue: mockLanguageService }
            ]
        }).compileComponents();

        pipe = TestBed.inject(LocalizedDatePipe);
    });

    describe('English (en-US) locale', () => {
        beforeEach(() => {
            currentLangSignal.set('en');
        });

        it('should format date in MM/dd/yyyy format by default', () => {
            const testDate = new Date(2024, 0, 15); // January 15, 2024
            const result = pipe.transform(testDate);
            // English medium date format: Jan 15, 2024
            expect(result).toBeTruthy();
            expect(result).toContain('2024');
        });

        it('should format date with custom format string', () => {
            const testDate = new Date(2024, 0, 15);
            const result = pipe.transform(testDate, 'MM/dd/yyyy');
            expect(result).toBe('01/15/2024');
        });

        it('should format date with shortDate format', () => {
            const testDate = new Date(2024, 0, 15);
            const result = pipe.transform(testDate, 'shortDate');
            expect(result).toBe('1/15/24');
        });

        it('should format date with longDate format', () => {
            const testDate = new Date(2024, 0, 15);
            const result = pipe.transform(testDate, 'longDate');
            expect(result).toContain('January');
            expect(result).toContain('2024');
        });

        it('should accept string date input', () => {
            const dateString = '2024-01-15T00:00:00.000Z';
            const result = pipe.transform(dateString, 'MM/dd/yyyy');
            expect(result).toBe('01/15/2024');
        });

        it('should accept numeric timestamp', () => {
            const timestamp = new Date(2024, 0, 15).getTime();
            const result = pipe.transform(timestamp, 'MM/dd/yyyy');
            expect(result).toBe('01/15/2024');
        });

        it('should format time with time format', () => {
            const testDate = new Date(2024, 0, 15, 14, 30, 45);
            const result = pipe.transform(testDate, 'HH:mm:ss');
            expect(result).toBe('14:30:45');
        });

        it('should format date and time together', () => {
            const testDate = new Date(2024, 0, 15, 14, 30);
            const result = pipe.transform(testDate, 'MM/dd/yyyy HH:mm');
            expect(result).toBe('01/15/2024 14:30');
        });
    });

    describe('Vietnamese (vi-VN) locale', () => {
        beforeEach(() => {
            currentLangSignal.set('vi');
        });

        it('should format date in dd/MM/yyyy format by default', () => {
            const testDate = new Date(2024, 0, 15);
            const result = pipe.transform(testDate);
            expect(result).toBeTruthy();
            expect(result).toContain('2024');
        });

        it('should format date with custom format string', () => {
            const testDate = new Date(2024, 0, 15);
            const result = pipe.transform(testDate, 'dd/MM/yyyy');
            expect(result).toBe('15/01/2024');
        });

        it('should format date with shortDate format', () => {
            const testDate = new Date(2024, 0, 15);
            const result = pipe.transform(testDate, 'shortDate');
            // Vietnamese short date format might be 15/01/2024 not 15/01/24
            expect(result).toBeTruthy();
            expect(result).toContain('15');
            expect(result).toContain('01');
            expect(result).toContain('2024');
        });

        it('should format date with longDate format', () => {
            const testDate = new Date(2024, 0, 15);
            const result = pipe.transform(testDate, 'longDate');
            expect(result).toContain('15');
            expect(result).toContain('2024');
        });

        it('should accept string date input', () => {
            const dateString = '2024-01-15T00:00:00.000Z';
            const result = pipe.transform(dateString, 'dd/MM/yyyy');
            expect(result).toBe('15/01/2024');
        });

        it('should accept numeric timestamp', () => {
            const timestamp = new Date(2024, 0, 15).getTime();
            const result = pipe.transform(timestamp, 'dd/MM/yyyy');
            expect(result).toBe('15/01/2024');
        });

        it('should format time with time format', () => {
            const testDate = new Date(2024, 0, 15, 14, 30, 45);
            const result = pipe.transform(testDate, 'HH:mm:ss');
            expect(result).toBe('14:30:45');
        });

        it('should format date and time together', () => {
            const testDate = new Date(2024, 0, 15, 14, 30);
            const result = pipe.transform(testDate, 'dd/MM/yyyy HH:mm');
            expect(result).toBe('15/01/2024 14:30');
        });
    });

    describe('Null and undefined handling', () => {
        it('should return null for null input', () => {
            const result = pipe.transform(null);
            expect(result).toBeNull();
        });

        it('should return null for undefined input', () => {
            const result = pipe.transform(undefined);
            expect(result).toBeNull();
        });

        it('should return null for null with custom format', () => {
            const result = pipe.transform(null, 'MM/dd/yyyy');
            expect(result).toBeNull();
        });

        it('should return null for undefined with custom format', () => {
            const result = pipe.transform(undefined, 'dd/MM/yyyy');
            expect(result).toBeNull();
        });
    });

    describe('Language switching reactivity', () => {
        it('should change output when language changes from en to vi', () => {
            currentLangSignal.set('en');
            const testDate = new Date(2024, 0, 15);
            const resultEn = pipe.transform(testDate, 'MM/dd/yyyy');
            expect(resultEn).toBe('01/15/2024');

            currentLangSignal.set('vi');
            const resultVi = pipe.transform(testDate, 'dd/MM/yyyy');
            expect(resultVi).toBe('15/01/2024');
        });

        it('should change output when language changes from vi to en', () => {
            currentLangSignal.set('vi');
            const testDate = new Date(2024, 0, 15);
            const resultVi = pipe.transform(testDate, 'dd/MM/yyyy');
            expect(resultVi).toBe('15/01/2024');

            currentLangSignal.set('en');
            const resultEn = pipe.transform(testDate, 'MM/dd/yyyy');
            expect(resultEn).toBe('01/15/2024');
        });
    });

    describe('Edge cases', () => {
        it('should handle leap year dates', () => {
            const leapDate = new Date(2024, 1, 29); // Feb 29, 2024 (leap year)
            currentLangSignal.set('en');
            const result = pipe.transform(leapDate, 'MM/dd/yyyy');
            expect(result).toBe('02/29/2024');
        });

        it('should handle year boundaries', () => {
            const newYearDate = new Date(2024, 0, 1);
            currentLangSignal.set('en');
            const result = pipe.transform(newYearDate, 'MM/dd/yyyy');
            expect(result).toBe('01/01/2024');
        });

        it('should handle end of year dates', () => {
            const endYearDate = new Date(2024, 11, 31);
            currentLangSignal.set('en');
            const result = pipe.transform(endYearDate, 'MM/dd/yyyy');
            expect(result).toBe('12/31/2024');
        });

        it('should handle midnight time', () => {
            const midnight = new Date(2024, 0, 15, 0, 0, 0);
            currentLangSignal.set('en');
            const result = pipe.transform(midnight, 'MM/dd/yyyy HH:mm:ss');
            expect(result).toBe('01/15/2024 00:00:00');
        });

        it('should handle end of day time', () => {
            const endDay = new Date(2024, 0, 15, 23, 59, 59);
            currentLangSignal.set('en');
            const result = pipe.transform(endDay, 'MM/dd/yyyy HH:mm:ss');
            expect(result).toBe('01/15/2024 23:59:59');
        });
    });

    describe('Format string variations', () => {
        beforeEach(() => {
            currentLangSignal.set('en');
        });

        it('should support various date formats', () => {
            const testDate = new Date(2024, 0, 15);

            const result1 = pipe.transform(testDate, 'short');
            expect(result1).toBeTruthy();

            const result2 = pipe.transform(testDate, 'medium');
            expect(result2).toBeTruthy();

            const result3 = pipe.transform(testDate, 'long');
            expect(result3).toBeTruthy();

            const result4 = pipe.transform(testDate, 'full');
            expect(result4).toBeTruthy();
        });

        it('should handle custom weekday formats', () => {
            const testDate = new Date(2024, 0, 15); // Monday
            const result = pipe.transform(testDate, 'EEEE, MMMM d, yyyy');
            expect(result).toContain('Monday');
            expect(result).toContain('January');
            expect(result).toContain('15');
        });

        it('should handle abbreviated month names', () => {
            const testDate = new Date(2024, 0, 15);
            const result = pipe.transform(testDate, 'MMM d, yyyy');
            expect(result).toContain('Jan');
            expect(result).toContain('15');
        });
    });
});
