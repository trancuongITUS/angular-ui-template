import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';
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
    private langSubscription?: Subscription;

    model: MenuItem[] = [];

    ngOnInit() {
        this.buildMenu();
        // Subscribe to language changes to rebuild menu
        this.langSubscription = this.translocoService.langChanges$.subscribe(() => {
            this.buildMenu();
        });
    }

    ngOnDestroy() {
        this.langSubscription?.unsubscribe();
    }

    private buildMenu() {
        const t = (key: string) => this.translocoService.translate(key);

        this.model = [
            {
                label: t('menu.home'),
                items: [{ label: t('menu.dashboard'), icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: t('menu.uiComponents'),
                items: [
                    { label: t('menu.formLayout'), icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
                    { label: t('menu.input'), icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
                    { label: t('menu.button'), icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
                    { label: t('menu.table'), icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
                    { label: t('menu.list'), icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
                    { label: t('menu.tree'), icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
                    { label: t('menu.panel'), icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
                    { label: t('menu.overlay'), icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
                    { label: t('menu.media'), icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
                    { label: t('menu.menu'), icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
                    { label: t('menu.message'), icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
                    { label: t('menu.file'), icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
                    { label: t('menu.chart'), icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
                    { label: t('menu.timeline'), icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
                    { label: t('menu.misc'), icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
                ]
            },
            {
                label: t('menu.pages'),
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {
                        label: t('menu.landing'),
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/landing']
                    },
                    {
                        label: t('menu.auth'),
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: t('menu.login'),
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/auth/login']
                            },
                            {
                                label: t('menu.error'),
                                icon: 'pi pi-fw pi-times-circle',
                                routerLink: ['/auth/error']
                            },
                            {
                                label: t('menu.accessDenied'),
                                icon: 'pi pi-fw pi-lock',
                                routerLink: ['/auth/access']
                            }
                        ]
                    },
                    {
                        label: t('menu.crud'),
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: ['/pages/crud']
                    },
                    {
                        label: t('menu.notFound'),
                        icon: 'pi pi-fw pi-exclamation-circle',
                        routerLink: ['/pages/notfound']
                    },
                    {
                        label: t('menu.empty'),
                        icon: 'pi pi-fw pi-circle-off',
                        routerLink: ['/pages/empty']
                    }
                ]
            },
            {
                label: t('menu.hierarchy'),
                items: [
                    {
                        label: `${t('menu.submenu')} 1`,
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: `${t('menu.submenu')} 1.1`,
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: `${t('menu.submenu')} 1.1.1`, icon: 'pi pi-fw pi-bookmark' },
                                    { label: `${t('menu.submenu')} 1.1.2`, icon: 'pi pi-fw pi-bookmark' },
                                    { label: `${t('menu.submenu')} 1.1.3`, icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: `${t('menu.submenu')} 1.2`,
                                icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: `${t('menu.submenu')} 1.2.1`, icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    },
                    {
                        label: `${t('menu.submenu')} 2`,
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: `${t('menu.submenu')} 2.1`,
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: `${t('menu.submenu')} 2.1.1`, icon: 'pi pi-fw pi-bookmark' },
                                    { label: `${t('menu.submenu')} 2.1.2`, icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: `${t('menu.submenu')} 2.2`,
                                icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: `${t('menu.submenu')} 2.2.1`, icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    }
                ]
            },
            {
                label: t('menu.getStarted'),
                items: [
                    {
                        label: t('menu.documentation'),
                        icon: 'pi pi-fw pi-book',
                        routerLink: ['/documentation']
                    },
                    {
                        label: t('menu.viewSource'),
                        icon: 'pi pi-fw pi-github',
                        url: 'https://github.com/primefaces/sakai-ng',
                        target: '_blank'
                    }
                ]
            }
        ];
    }
}
