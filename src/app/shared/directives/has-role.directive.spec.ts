import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HasRoleDirective } from './has-role.directive';
import { AuthService } from '@core/auth/services/auth.service';
import { User } from '@core/auth/models/user.model';

// Test host component
@Component({
    standalone: true,
    imports: [HasRoleDirective],
    template: `
        <div *appHasRole="requiredRoles" data-testid="protected">Protected Content</div>
    `
})
class TestHostComponent {
    requiredRoles: string | string[] = [];
}

describe('HasRoleDirective', () => {
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

    it('should show element when user has required role', () => {
        mockAuthService.hasAnyRole.and.returnValue(true);
        component.requiredRoles = 'ADMIN';
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css('[data-testid="protected"]'));
        expect(el).toBeTruthy();
    });

    it('should hide element when user lacks required role', () => {
        mockAuthService.hasAnyRole.and.returnValue(false);
        component.requiredRoles = 'ADMIN';
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css('[data-testid="protected"]'));
        expect(el).toBeFalsy();
    });

    it('should show element when user has any of multiple roles', () => {
        mockAuthService.hasAnyRole.and.returnValue(true);
        component.requiredRoles = ['ADMIN', 'MANAGER'];
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css('[data-testid="protected"]'));
        expect(el).toBeTruthy();
        expect(mockAuthService.hasAnyRole).toHaveBeenCalledWith(['ADMIN', 'MANAGER']);
    });

    it('should show element when no roles specified (permissive fallback)', () => {
        component.requiredRoles = [];
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css('[data-testid="protected"]'));
        expect(el).toBeTruthy();
        expect(mockAuthService.hasAnyRole).not.toHaveBeenCalled();
    });

    it('should show element when empty string role specified', () => {
        component.requiredRoles = '';
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css('[data-testid="protected"]'));
        expect(el).toBeTruthy();
        expect(mockAuthService.hasAnyRole).not.toHaveBeenCalled();
    });
});
