import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, signal, ViewChild, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';
import { Product, ProductService } from '@core/services/data/product.service';
import { InventoryStatus, INVENTORY_STATUSES } from '@shared/models';
import { CrudColumn, CrudExportColumn, CRUD_TABLE_COLUMNS, createExportColumns, getCrudSeverity, createProductId } from './crud.helpers';
import { LocalizedCurrencyPipe } from '@shared/pipes';

@Component({
    selector: 'app-crud',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        TranslocoModule,
        LocalizedCurrencyPipe
    ],
    templateUrl: './crud.component.html',
    providers: [MessageService, ProductService, ConfirmationService]
})
export class CrudComponent implements OnInit, OnDestroy {
    private readonly productService = inject(ProductService);
    private readonly messageService = inject(MessageService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly translocoService = inject(TranslocoService);
    private langSubscription?: Subscription;

    @ViewChild('dt') dt!: Table;

    productDialog = false;
    products = signal<Product[]>([]);
    product: Product = {};
    selectedProducts: Product[] | null = null;
    submitted = false;
    statuses: InventoryStatus[] = INVENTORY_STATUSES;
    exportColumns: CrudExportColumn[] = [];
    cols: CrudColumn[] = [];

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadDemoData();
        // Subscribe to language changes
        this.langSubscription = this.translocoService.langChanges$.subscribe(() => {
            // Trigger change detection for translated content
        });
    }

    ngOnDestroy() {
        this.langSubscription?.unsubscribe();
    }

    loadDemoData() {
        this.productService.getProducts().then((data) => {
            this.products.set(data);
        });

        this.cols = CRUD_TABLE_COLUMNS;
        this.exportColumns = createExportColumns(this.cols);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.product = {};
        this.submitted = false;
        this.productDialog = true;
    }

    editProduct(product: Product) {
        this.product = { ...product };
        this.productDialog = true;
    }

    deleteSelectedProducts() {
        const t = (key: string) => this.translocoService.translate(key);
        this.confirmationService.confirm({
            message: t('crud.confirmDeleteSelected'),
            header: t('common.confirm'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.products.set(this.products().filter((val) => !this.selectedProducts?.includes(val)));
                this.selectedProducts = null;
                this.messageService.add({
                    severity: 'success',
                    summary: t('crud.successful'),
                    detail: t('crud.productsDeleted'),
                    life: 3000
                });
            }
        });
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted = false;
    }

    deleteProduct(product: Product) {
        const t = (key: string, params?: object) => this.translocoService.translate(key, params);
        this.confirmationService.confirm({
            message: t('crud.confirmDeleteProduct', { name: product.name }),
            header: t('common.confirm'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.products.set(this.products().filter((val) => val.id !== product.id));
                this.product = {};
                this.messageService.add({
                    severity: 'success',
                    summary: t('crud.successful'),
                    detail: t('crud.productDeleted'),
                    life: 3000
                });
            }
        });
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.products().length; i++) {
            if (this.products()[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    getSeverity(status: string) {
        return getCrudSeverity(status);
    }

    /** Track products by id for table performance optimization */
    trackById(index: number, item: Product): string {
        return item.id || String(index);
    }

    saveProduct() {
        this.submitted = true;

        if (!this.product.name?.trim()) {
            return;
        }

        const t = (key: string) => this.translocoService.translate(key);
        const _products = this.products();

        if (this.product.id) {
            _products[this.findIndexById(this.product.id)] = this.product;
            this.products.set([..._products]);
            this.messageService.add({
                severity: 'success',
                summary: t('crud.successful'),
                detail: t('crud.productUpdated'),
                life: 3000
            });
        } else {
            this.product.id = createProductId();
            this.product.image = 'product-placeholder.svg';
            this.messageService.add({
                severity: 'success',
                summary: t('crud.successful'),
                detail: t('crud.productCreated'),
                life: 3000
            });
            this.products.set([..._products, this.product]);
        }

        this.productDialog = false;
        this.product = {};
    }
}
