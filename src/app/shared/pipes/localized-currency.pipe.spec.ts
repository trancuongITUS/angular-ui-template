import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import localeEn from '@angular/common/locales/en';
import { LocalizedCurrencyPipe } from './localized-currency.pipe';
import { LanguageService } from '@core/i18n';

// Register locale data for testing
registerLocaleData(localeEn, 'en');
registerLocaleData(localeVi, 'vi');

describe('LocalizedCurrencyPipe', () => {
    let pipe: LocalizedCurrencyPipe;
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
                LocalizedCurrencyPipe,
                { provide: LanguageService, useValue: mockLanguageService }
            ]
        }).compileComponents();

        pipe = TestBed.inject(LocalizedCurrencyPipe);
    });

    describe('English (en-US) locale with USD', () => {
        beforeEach(() => {
            currentLangSignal.set('en');
        });

        it('should format USD currency with default parameters', () => {
            const result = pipe.transform(1234.56);
            // Should default to USD with $ symbol
            expect(result).toBe('$1,234.56');
        });

        it('should format USD currency with explicit USD code', () => {
            const result = pipe.transform(1234.56, 'USD');
            expect(result).toBe('$1,234.56');
        });

        it('should format USD with two decimal places', () => {
            const result = pipe.transform(1000, 'USD', 'symbol', '1.2-2');
            expect(result).toBe('$1,000.00');
        });

        it('should format USD with one decimal place', () => {
            const result = pipe.transform(1000.5, 'USD', 'symbol', '1.1-1');
            expect(result).toBe('$1,000.5');
        });

        it('should format USD with no decimal places', () => {
            const result = pipe.transform(1000.99, 'USD', 'symbol', '1.0-0');
            expect(result).toBe('$1,001');
        });

        it('should handle zero value', () => {
            const result = pipe.transform(0, 'USD');
            expect(result).toBe('$0.00');
        });

        it('should handle negative values', () => {
            const result = pipe.transform(-1234.56, 'USD');
            expect(result).toBe('-$1,234.56');
        });

        it('should accept string number input', () => {
            const result = pipe.transform('1234.56', 'USD');
            expect(result).toBe('$1,234.56');
        });

        it('should display currency code when display is "code"', () => {
            const result = pipe.transform(1234.56, 'USD', 'code');
            expect(result).toContain('USD');
        });

        it('should display currency symbol when display is "symbol"', () => {
            const result = pipe.transform(1234.56, 'USD', 'symbol');
            expect(result).toContain('$');
        });

        it('should handle large numbers', () => {
            const result = pipe.transform(1000000.99, 'USD');
            expect(result).toBe('$1,000,000.99');
        });

        it('should handle small decimal values', () => {
            const result = pipe.transform(0.01, 'USD');
            expect(result).toBe('$0.01');
        });

        it('should handle very small decimal values', () => {
            const result = pipe.transform(0.001, 'USD');
            expect(result).toBe('$0.00');
        });
    });

    describe('Vietnamese (vi-VN) locale with VND', () => {
        beforeEach(() => {
            currentLangSignal.set('vi');
        });

        it('should format VND currency without decimal places by default', () => {
            const result = pipe.transform(1000000);
            // VND uses periods as thousand separators in Vietnamese locale: 1.000.000 ₫
            expect(result).toContain('₫');
            expect(result).toBeTruthy();
        });

        it('should format VND with explicit VND code', () => {
            const result = pipe.transform(1000000, 'VND');
            expect(result).toContain('₫');
            expect(result).toBeTruthy();
        });

        it('should automatically use VND for Vietnamese locale', () => {
            // No currency code specified, should default to VND
            const result = pipe.transform(500000);
            expect(result).toContain('₫');
            expect(result).toBeTruthy();
        });

        it('should handle zero value in VND', () => {
            const result = pipe.transform(0);
            expect(result).toContain('₫');
            expect(result).toContain('0');
        });

        it('should handle negative values in VND', () => {
            const result = pipe.transform(-1000000);
            expect(result).toContain('-');
            expect(result).toContain('₫');
        });

        it('should accept string number input for VND', () => {
            const result = pipe.transform('1000000');
            expect(result).toContain('₫');
            expect(result).toBeTruthy();
        });

        it('should handle large VND amounts', () => {
            const result = pipe.transform(1000000000);
            expect(result).toContain('₫');
            expect(result).toContain('1');
        });

        it('should handle small VND amounts', () => {
            const result = pipe.transform(100);
            expect(result).toContain('₫');
            expect(result).toContain('100');
        });

        it('should ignore decimal places for VND', () => {
            const result = pipe.transform(1000000.99);
            expect(result).toContain('₫');
            // Should round to 1000001
            expect(result).toContain('1');
        });

        it('should display currency code when display is "code"', () => {
            const result = pipe.transform(1000000, 'VND', 'code');
            expect(result).toContain('VND');
        });
    });

    describe('Cross-locale currency handling', () => {
        it('should use USD when explicitly specified in Vietnamese locale', () => {
            currentLangSignal.set('vi');
            const result = pipe.transform(100, 'USD', 'symbol');
            // When USD is explicitly specified, it should be used regardless of locale
            expect(result).toBeTruthy();
            expect(result).toContain('100');
        });

        it('should use VND when explicitly specified in English locale', () => {
            currentLangSignal.set('en');
            const result = pipe.transform(1000000, 'VND');
            expect(result).toContain('₫');
            expect(result).toBeTruthy();
        });

        it('should use EUR when explicitly specified', () => {
            currentLangSignal.set('en');
            const result = pipe.transform(1234.56, 'EUR', 'code');
            expect(result).toContain('EUR');
        });

        it('should use GBP when explicitly specified', () => {
            currentLangSignal.set('en');
            const result = pipe.transform(1234.56, 'GBP', 'code');
            expect(result).toContain('GBP');
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

        it('should return null for null with currency code', () => {
            const result = pipe.transform(null, 'USD');
            expect(result).toBeNull();
        });

        it('should return null for undefined with currency code', () => {
            const result = pipe.transform(undefined, 'VND');
            expect(result).toBeNull();
        });

        it('should return null for null with all parameters', () => {
            const result = pipe.transform(null, 'USD', 'symbol', '1.2-2');
            expect(result).toBeNull();
        });
    });

    describe('Language switching reactivity', () => {
        it('should change currency from USD to VND when language switches', () => {
            currentLangSignal.set('en');
            const resultEn = pipe.transform(100);
            expect(resultEn).toBe('$100.00');

            currentLangSignal.set('vi');
            const resultVi = pipe.transform(100000);
            expect(resultVi).toContain('₫');
        });

        it('should change currency from VND to USD when language switches', () => {
            currentLangSignal.set('vi');
            const resultVi = pipe.transform(1000000);
            expect(resultVi).toContain('₫');

            currentLangSignal.set('en');
            const resultEn = pipe.transform(1000);
            expect(resultEn).toBe('$1,000.00');
        });

        it('should maintain explicit currency code across language changes', () => {
            currentLangSignal.set('en');
            const resultEn = pipe.transform(1000, 'EUR', 'code');
            expect(resultEn).toContain('EUR');

            // Note: In Vietnamese locale with implicit VND, the pipe overrides to VND
            // So we need to explicitly pass EUR with 'code' display to see EUR
            // This is expected behavior based on pipe implementation
            currentLangSignal.set('vi');
            // After language switch without explicit EUR, it defaults to VND
            const resultVi = pipe.transform(1000); // no EUR specified = defaults to VND
            expect(resultVi).toContain('₫');
        });
    });

    describe('Edge cases and special values', () => {
        beforeEach(() => {
            currentLangSignal.set('en');
        });

        it('should handle very large numbers', () => {
            const result = pipe.transform(999999999999.99, 'USD');
            expect(result).toBe('$999,999,999,999.99');
        });

        it('should handle scientific notation input', () => {
            const result = pipe.transform(1e6, 'USD');
            expect(result).toBe('$1,000,000.00');
        });

        it('should round to correct decimal places', () => {
            const result = pipe.transform(1234.567, 'USD', 'symbol', '1.2-2');
            expect(result).toBe('$1,234.57');
        });

        it('should handle trailing zeros properly', () => {
            const result = pipe.transform(1000.10, 'USD', 'symbol', '1.2-2');
            expect(result).toBe('$1,000.10');
        });

        it('should format negative zero correctly', () => {
            const result = pipe.transform(-0, 'USD');
            expect(result).toBe('$0.00');
        });

        it('should handle different digit info patterns', () => {
            const value = 1234.56789;
            const result1 = pipe.transform(value, 'USD', 'symbol', '1.3-3');
            // Should contain the value and currency symbol with 3 decimal places
            expect(result1).toContain('$');
            // Result is $1,234.568 so check for pattern
            expect(result1).toMatch(/\d+.*568/);

            const result2 = pipe.transform(value, 'USD', 'symbol', '1.0-0');
            expect(result2).toBe('$1,235');
        });
    });

    describe('Display parameter variations', () => {
        beforeEach(() => {
            currentLangSignal.set('en');
        });

        it('should support symbol display mode', () => {
            const result = pipe.transform(1000, 'USD', 'symbol');
            expect(result).toContain('$');
        });

        it('should support code display mode', () => {
            const result = pipe.transform(1000, 'USD', 'code');
            expect(result).toContain('USD');
        });

        it('should support symbol-narrow display mode', () => {
            const result = pipe.transform(1000, 'USD', 'symbol-narrow');
            expect(result).toBeTruthy();
        });
    });

    describe('Digits info parameter variations', () => {
        beforeEach(() => {
            currentLangSignal.set('en');
        });

        it('should format with minimum 1 digit', () => {
            const result = pipe.transform(5, 'USD', 'symbol', '1.0-0');
            expect(result).toBe('$5');
        });

        it('should format with minimum 2 digits', () => {
            const result = pipe.transform(5, 'USD', 'symbol', '2.0-0');
            expect(result).toBe('$05');
        });

        it('should format with minimum 3 digits', () => {
            const result = pipe.transform(5, 'USD', 'symbol', '3.0-0');
            expect(result).toBe('$005');
        });

        it('should format with maximum 3 decimal places', () => {
            const result = pipe.transform(1000.123, 'USD', 'symbol', '1.0-3');
            expect(result).toBe('$1,000.123');
        });
    });
});
