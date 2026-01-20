import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TranslocoService } from '@jsverse/transloco';
import { Subscription, switchMap } from 'rxjs';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit, OnDestroy {
    private readonly translocoService = inject(TranslocoService);
    private readonly cdr = inject(ChangeDetectorRef);
    private langSubscription?: Subscription;

    model: MenuItem[] = [];

    ngOnInit() {
        // Use selectTranslateObject to wait for translations to be loaded
        // This emits only when translations are ready, then re-emits on language change
        this.langSubscription = this.translocoService.langChanges$
            .pipe(switchMap((lang) => this.translocoService.selectTranslateObject('menu', {}, lang)))
            .subscribe((menuTranslations) => {
                this.buildMenu(menuTranslations);
                this.cdr.markForCheck(); // Trigger change detection for OnPush
            });
    }

    ngOnDestroy() {
        this.langSubscription?.unsubscribe();
    }

    private buildMenu(t: Record<string, string>) {
        this.model = [
            {
                label: t['home'],
                items: [{ label: t['dashboard'], icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: t['uiComponents'],
                items: [
                    { label: t['formLayout'], icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
                    { label: t['input'], icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
                    { label: t['button'], icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
                    { label: t['table'], icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
                    { label: t['list'], icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
                    { label: t['tree'], icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
                    { label: t['panel'], icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
                    { label: t['overlay'], icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
                    { label: t['media'], icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
                    { label: t['menu'], icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
                    { label: t['message'], icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
                    { label: t['file'], icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
                    { label: t['chart'], icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
                    { label: t['timeline'], icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
                    { label: t['misc'], icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
                ]
            },
            {
                label: t['pages'],
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    { label: t['landing'], icon: 'pi pi-fw pi-globe', routerLink: ['/landing'] },
                    {
                        label: t['auth'],
                        icon: 'pi pi-fw pi-user',
                        items: [
                            { label: t['login'], icon: 'pi pi-fw pi-sign-in', routerLink: ['/auth/login'] },
                            { label: t['error'], icon: 'pi pi-fw pi-times-circle', routerLink: ['/auth/error'] },
                            { label: t['accessDenied'], icon: 'pi pi-fw pi-lock', routerLink: ['/auth/access'] }
                        ]
                    },
                    { label: t['crud'], icon: 'pi pi-fw pi-pencil', routerLink: ['/pages/crud'] },
                    { label: t['notFound'], icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/pages/notfound'] },
                    { label: t['empty'], icon: 'pi pi-fw pi-circle-off', routerLink: ['/pages/empty'] }
                ]
            },
            {
                label: t['hierarchy'],
                items: [
                    {
                        label: `${t['submenu']} 1`,
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: `${t['submenu']} 1.1`,
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: `${t['submenu']} 1.1.1`, icon: 'pi pi-fw pi-bookmark' },
                                    { label: `${t['submenu']} 1.1.2`, icon: 'pi pi-fw pi-bookmark' },
                                    { label: `${t['submenu']} 1.1.3`, icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: `${t['submenu']} 1.2`,
                                icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: `${t['submenu']} 1.2.1`, icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    },
                    {
                        label: `${t['submenu']} 2`,
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: `${t['submenu']} 2.1`,
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: `${t['submenu']} 2.1.1`, icon: 'pi pi-fw pi-bookmark' },
                                    { label: `${t['submenu']} 2.1.2`, icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: `${t['submenu']} 2.2`,
                                icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: `${t['submenu']} 2.2.1`, icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    }
                ]
            },
            {
                label: t['getStarted'],
                items: [
                    { label: t['documentation'], icon: 'pi pi-fw pi-book', routerLink: ['/documentation'] },
                    { label: t['viewSource'], icon: 'pi pi-fw pi-github', url: 'https://github.com/primefaces/sakai-ng', target: '_blank' }
                ]
            }
        ];
    }
}
