import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { Product, ProductService } from '@core/services/data/product.service';
import { LocalizedCurrencyPipe } from '@shared/pipes';

@Component({
    standalone: true,
    selector: 'app-recent-sales-widget',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, TranslocoModule, LocalizedCurrencyPipe],
    template: `<div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">{{ 'dashboard.recentSales' | transloco }}</div>
        <p-table [value]="products()" [paginator]="true" [rows]="5" [rowTrackBy]="trackByProductId" responsiveLayout="scroll">
            <ng-template #header>
                <tr>
                    <th>{{ 'crud.image' | transloco }}</th>
                    <th pSortableColumn="name">{{ 'crud.name' | transloco }} <p-sortIcon field="name"></p-sortIcon></th>
                    <th pSortableColumn="price">{{ 'crud.price' | transloco }} <p-sortIcon field="price"></p-sortIcon></th>
                    <th>{{ 'table.view' | transloco }}</th>
                </tr>
            </ng-template>
            <ng-template #body let-product>
                <tr>
                    <td style="width: 15%; min-width: 5rem;">
                        <img src="https://primefaces.org/cdn/primevue/images/product/{{ product.image }}" class="shadow-lg" alt="{{ product.name }}" width="50" />
                    </td>
                    <td style="width: 35%; min-width: 7rem;">{{ product.name }}</td>
                    <td style="width: 35%; min-width: 8rem;">{{ product.price | localizedCurrency }}</td>
                    <td style="width: 15%;">
                        <button pButton pRipple type="button" icon="pi pi-search" class="p-button p-component p-button-text p-button-icon-only" aria-label="View product details"></button>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>`,
    providers: [ProductService]
})
export class RecentSalesWidget implements OnInit {
    products = signal<Product[]>([]);

    constructor(private productService: ProductService) {}

    ngOnInit() {
        this.productService.getProductsSmall().then((data) => this.products.set(data));
    }

    /** Track products by id for table performance optimization */
    trackByProductId(index: number, item: Product): string {
        return item.id || String(index);
    }
}
