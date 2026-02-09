import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AppFloatingConfigurator } from '@layout/components/app.floatingconfigurator';
import { AuthService } from '@core/auth';
import { LogoComponent } from '@shared/components';

@Component({
    selector: 'app-login',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, MessageModule, TranslocoModule, AppFloatingConfigurator, LogoComponent],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <app-logo width="50" height="50" class="mb-8 mx-auto block" />
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">{{ 'pages.login.welcomeTitle' | transloco }}</div>
                            <span class="text-muted-color font-medium">{{ 'pages.login.signInToContinue' | transloco }}</span>
                        </div>

                        <div>
                            @if (errorMessage()) {
                                <p-message severity="error" [text]="errorMessage()!" styleClass="w-full mb-4" />
                            }

                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">{{ 'auth.email' | transloco }}</label>
                            <input pInputText id="email1" type="email" [placeholder]="'pages.login.emailPlaceholder' | transloco" class="w-full md:w-120 mb-8" [(ngModel)]="email" [disabled]="isLoading()" (keyup.enter)="onLogin()" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">{{ 'auth.password' | transloco }}</label>
                            <p-password id="password1" [(ngModel)]="password" [placeholder]="'pages.login.passwordPlaceholder' | transloco" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false" [disabled]="isLoading()" (keyup.enter)="onLogin()"></p-password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="rememberMe" id="rememberme1" binary class="mr-2" [disabled]="isLoading()"></p-checkbox>
                                    <label for="rememberme1">{{ 'auth.rememberMe' | transloco }}</label>
                                </div>
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">{{ 'auth.forgotPassword' | transloco }}</span>
                            </div>
                            <p-button [label]="'auth.signIn' | transloco" styleClass="w-full" [loading]="isLoading()" [disabled]="isLoading() || !email || !password" (onClick)="onLogin()"></p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class LoginComponent {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly translocoService = inject(TranslocoService);

    // Form fields
    email = '';
    password = '';
    rememberMe = false;

    // Reactive state with signals
    readonly isLoading = signal(false);
    readonly errorMessage = signal<string | null>(null);

    /** Minimum password length requirement */
    private readonly MIN_PASSWORD_LENGTH = 8;

    /**
     * Handles login form submission.
     */
    onLogin(): void {
        // Clear previous errors
        this.errorMessage.set(null);
        const t = (key: string, params?: object) => this.translocoService.translate(key, params);

        // Validate inputs
        if (!this.email || !this.password) {
            this.errorMessage.set(t('pages.login.enterBothFields'));
            return;
        }

        // Validate email format
        if (!this.isValidEmail(this.email)) {
            this.errorMessage.set(t('pages.login.invalidEmail'));
            return;
        }

        // Validate password length
        if (this.password.length < this.MIN_PASSWORD_LENGTH) {
            this.errorMessage.set(t('pages.login.passwordMinLength', { length: this.MIN_PASSWORD_LENGTH }));
            return;
        }

        this.isLoading.set(true);

        this.authService
            .login({
                email: this.email,
                password: this.password,
                // TODO: Uncomment when function is ready
                // rememberMe: this.rememberMe
            })
            .subscribe({
                next: () => {
                    this.isLoading.set(false);

                    // Get the return URL from query params or default to home
                    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                    this.router.navigate([returnUrl]);
                },
                error: (error) => {
                    this.isLoading.set(false);

                    // Extract error message
                    const message = error?.message || error?.error?.message || this.translocoService.translate('pages.login.loginFailed');
                    this.errorMessage.set(message);

                    // Clear password on error
                    this.password = '';
                }
            });
    }

    /**
     * Validates email format with stricter RFC 5322 compliant pattern.
     */
    private isValidEmail(email: string): boolean {
        // RFC 5322 compliant email regex - validates proper TLD format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
}
