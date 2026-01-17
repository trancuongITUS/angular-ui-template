import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from '@core/auth/services/auth.service';

/**
 * Structural directive to show/hide elements based on user roles.
 * Reactively updates when user authentication state changes.
 * NOTE: Client-side only - backend must re-verify for security.
 *
 * @example
 * <button *appHasRole="'ADMIN'">Admin Panel</button>
 * <div *appHasRole="['ADMIN', 'MANAGER']">Management Options</div>
 */
@Directive({
    selector: '[appHasRole]',
    standalone: true
})
export class HasRoleDirective implements OnInit, OnDestroy {
    @Input() appHasRole: string | string[] = [];

    private readonly authService = inject(AuthService);
    private destroy$ = new Subject<void>();
    private hasView = false;

    constructor(
        private templateRef: TemplateRef<unknown>,
        private viewContainer: ViewContainerRef
    ) {
        // React to auth state changes (login/logout/role updates)
        effect(() => {
            // Track the currentUser signal - triggers re-evaluation on change
            this.authService.currentUser();
            this.updateView();
        });
    }

    ngOnInit(): void {
        this.updateView();
    }

    private updateView(): void {
        const hasRole = this.checkRole();

        if (hasRole && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!hasRole && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }

    /**
     * Checks if user has required role(s).
     * Returns true if no roles specified (permissive fallback for undefined requirements).
     */
    private checkRole(): boolean {
        const roles = Array.isArray(this.appHasRole) ? this.appHasRole : [this.appHasRole];

        // If no roles specified, allow access (element visible)
        if (roles.length === 0 || (roles.length === 1 && !roles[0])) {
            return true;
        }

        return this.authService.hasAnyRole(roles);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
