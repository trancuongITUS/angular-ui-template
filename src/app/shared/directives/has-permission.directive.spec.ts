import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HasPermissionDirective } from './has-permission.directive';
import { AuthService } from '@core/auth/services/auth.service';
import { User } from '@core/auth/models/user.model';

// Test host component
@Component({
    standalone: true,
    imports: [HasPermissionDirective],
    template: `
        <div *appHasPermission="requiredPermissions" data-testid="protected">Protected Content</div>
    `
})
class TestHostComponent {
    requiredPermissions: string | string[] = [];
}

describe('HasPermissionDirective', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let component: TestHostComponent;
    let mockAuthService: jasmine.SpyObj<AuthService>;
    // Writable signal for testing reactive behavior
    const currentUserSignal = signal<User | null>(null);

    beforeEach(async () => {
        mockAuthService = jasmine.createSpyObj('AuthService', ['hasAnyRole', 'hasPermission'], {
            currentUser: currentUserSignal.asReadonly()
        });

        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
            providers: [{ provide: AuthService, useValue: mockAuthService }]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
    });

    it('should show element when user has required permission', () => {
        mockAuthService.hasPermission.and.returnValue(true);
        component.requiredPermissions = 'employee.create';
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css('[data-testid="protected"]'));
        expect(el).toBeTruthy();
        expect(mockAuthService.hasPermission).toHaveBeenCalledWith('employee.create');
    });

    it('should hide element when user lacks required permission', () => {
        mockAuthService.hasPermission.and.returnValue(false);
        component.requiredPermissions = 'employee.create';
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css('[data-testid="protected"]'));
        expect(el).toBeFalsy();
    });

    it('should show element when user has any of multiple permissions', () => {
        mockAuthService.hasPermission.and.callFake((permission: string) => {
            return permission === 'employee.edit';
        });
        component.requiredPermissions = ['employee.create', 'employee.edit'];
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css('[data-testid="protected"]'));
        expect(el).toBeTruthy();
    });

    it('should hide element when user has none of multiple permissions', () => {
        mockAuthService.hasPermission.and.returnValue(false);
        component.requiredPermissions = ['employee.create', 'employee.edit'];
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css('[data-testid="protected"]'));
        expect(el).toBeFalsy();
    });

    it('should show element when no permissions specified (permissive fallback)', () => {
        component.requiredPermissions = [];
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css('[data-testid="protected"]'));
        expect(el).toBeTruthy();
        expect(mockAuthService.hasPermission).not.toHaveBeenCalled();
    });

    it('should show element when empty string permission specified', () => {
        component.requiredPermissions = '';
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css('[data-testid="protected"]'));
        expect(el).toBeTruthy();
        expect(mockAuthService.hasPermission).not.toHaveBeenCalled();
    });
});
