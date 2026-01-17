import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from '@core/auth/services/auth.service';

/**
 * Structural directive to show/hide elements based on user permissions.
 * Reactively updates when user authentication state changes.
 * NOTE: Client-side only - backend must re-verify for security.
 *
 * @example
 * <button *appHasPermission="'employee.create'">Create Employee</button>
 * <div *appHasPermission="['employee.edit', 'employee.delete']">Edit Options</div>
 */
@Directive({
    selector: '[appHasPermission]',
    standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
    @Input() appHasPermission: string | string[] = [];

    private readonly authService = inject(AuthService);
    private destroy$ = new Subject<void>();
    private hasView = false;

    constructor(
        private templateRef: TemplateRef<unknown>,
        private viewContainer: ViewContainerRef
    ) {
        // React to auth state changes (login/logout/permission updates)
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
        const hasPermission = this.checkPermission();

        if (hasPermission && !this.hasView) {
            this.viewContainer.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (!hasPermission && this.hasView) {
            this.viewContainer.clear();
            this.hasView = false;
        }
    }

    /**
     * Checks if user has required permission(s).
     * Returns true if no permissions specified (permissive fallback).
     */
    private checkPermission(): boolean {
        const permissions = Array.isArray(this.appHasPermission) ? this.appHasPermission : [this.appHasPermission];

        // If no permissions specified, allow access
        if (permissions.length === 0 || (permissions.length === 1 && !permissions[0])) {
            return true;
        }

        // Check if user has any of the required permissions
        return permissions.some((permission) => this.authService.hasPermission(permission));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
