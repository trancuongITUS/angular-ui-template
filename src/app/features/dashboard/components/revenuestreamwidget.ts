import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal, inject, ChangeDetectorRef } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { debounceTime, Subscription, switchMap } from 'rxjs';
import { LayoutService } from '@layout/services/layout.service';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ChartModule, TranslocoModule],
    template: `<div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">{{ 'dashboard.revenueStream' | transloco }}</div>
        <p-chart type="bar" [data]="chartData()" [options]="chartOptions()" class="h-100" />
    </div>`
})
export class RevenueStreamWidget implements OnInit, OnDestroy {
    private readonly translocoService = inject(TranslocoService);
    private readonly cdr = inject(ChangeDetectorRef);
    chartData = signal<any>(null);

    chartOptions = signal<any>(null);

    subscription!: Subscription;
    langSubscription?: Subscription;

    constructor(public layoutService: LayoutService) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart({});
        });
    }

    ngOnInit() {
        this.langSubscription = this.translocoService.langChanges$
            .pipe(switchMap((lang) => this.translocoService.selectTranslateObject('dashboard', {}, lang)))
            .subscribe((dashboardTranslations) => {
                this.initChart(dashboardTranslations);
                this.cdr.markForCheck(); // Trigger change detection for OnPush
            });
    }

    initChart(t: Record<string, string>) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        this.chartData.set({
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [
                {
                    type: 'bar',
                    label: t['subscriptions'] || 'Subscriptions',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-400'),
                    data: [4000, 10000, 15000, 4000],
                    barThickness: 32
                },
                {
                    type: 'bar',
                    label: t['advertising'] || 'Advertising',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-300'),
                    data: [2100, 8400, 2400, 7500],
                    barThickness: 32
                },
                {
                    type: 'bar',
                    label: t['affiliate'] || 'Affiliate',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    data: [4100, 5200, 3400, 7400],
                    borderRadius: {
                        topLeft: 8,
                        topRight: 8,
                        bottomLeft: 0,
                        bottomRight: 0
                    },
                    borderSkipped: false,
                    barThickness: 32
                }
            ]
        });

        this.chartOptions.set({
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: 'transparent',
                        borderColor: 'transparent'
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: textMutedColor
                    },
                    grid: {
                        color: borderColor,
                        borderColor: 'transparent',
                        drawTicks: false
                    }
                }
            }
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.langSubscription?.unsubscribe();
    }
}
