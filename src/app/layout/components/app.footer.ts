import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-footer',
    imports: [TranslocoModule],
    template: `<div class="layout-footer">
        SAKAI {{ 'footer.by' | transloco }}
        <a href="https://primeng.org" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">PrimeNG</a>
    </div>`
})
export class AppFooter {}
