import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { AppFloatingConfigurator } from '@layout/components/app.floatingconfigurator';
import { AuthService } from '@core/auth';
import { LogoComponent } from '@shared/components';

@Component({
    selector: 'app-login',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, MessageModule, AppFloatingConfigurator, LogoComponent],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <app-logo width="50" height="50" class="mb-8 mx-auto block" />
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome to PrimeLand!</div>
                            <span class="text-muted-color font-medium">Sign in to continue</span>
                        </div>

                        <div>
                            @if (errorMessage()) {
                                <p-message severity="error" [text]="errorMessage()!" styleClass="w-full mb-4" />
                            }

                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText id="email1" type="email" placeholder="Email address" class="w-full md:w-120 mb-8" [(ngModel)]="email" [disabled]="isLoading()" (keyup.enter)="onLogin()" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false" [disabled]="isLoading()" (keyup.enter)="onLogin()"></p-password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="rememberMe" id="rememberme1" binary class="mr-2" [disabled]="isLoading()"></p-checkbox>
                                    <label for="rememberme1">Remember me</label>
                                </div>
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Forgot password?</span>
                            </div>
                            <p-button label="Sign In" styleClass="w-full" [loading]="isLoading()" [disabled]="isLoading() || !email || !password" (onClick)="onLogin()"></p-button>
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

    // Form fields
    email = '';
    password = '';
    rememberMe = false;

    // Reactive state with signals
    readonly isLoading = signal(false);
    readonly errorMessage = signal<string | null>(null);

    /**
     * Handles login form submission.
     */
    onLogin(): void {
        // Clear previous errors
        this.errorMessage.set(null);

        // Validate inputs
        if (!this.email || !this.password) {
            this.errorMessage.set('Please enter both email and password.');
            return;
        }

        // Validate email format
        if (!this.isValidEmail(this.email)) {
            this.errorMessage.set('Please enter a valid email address.');
            return;
        }

        this.isLoading.set(true);

        this.authService
            .login({
                email: this.email,
                password: this.password,
                rememberMe: this.rememberMe
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
                    const message = error?.message || error?.error?.message || 'Login failed. Please check your credentials.';
                    this.errorMessage.set(message);

                    // Clear password on error
                    this.password = '';
                }
            });
    }

    /**
     * Validates email format.
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
