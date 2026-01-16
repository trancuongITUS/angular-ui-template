import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Toast } from 'primeng/toast';
import { AppStore } from './app/core/store/app.store';
import { ThemeSyncService } from './app/layout/services/theme-sync.service';

@Component({
    selector: 'app-root',
    imports: [RouterModule, Toast],
    template: `
        <p-toast position="top-right" />
        <router-outlet />
    `
})
export class AppComponent implements OnInit {
    private readonly appStore = inject(AppStore);
    private readonly themeSyncService = inject(ThemeSyncService);

    ngOnInit(): void {
        // Initialize theme synchronization between AppStore and LayoutService
        this.themeSyncService.initialize(() => this.appStore.theme());
    }
}
