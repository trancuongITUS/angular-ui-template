/**
 * Returns severity tag for inventory status display.
 */
export function getCrudSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
        case 'INSTOCK':
            return 'success';
        case 'LOWSTOCK':
            return 'warn';
        case 'OUTOFSTOCK':
            return 'danger';
        default:
            return 'info';
    }
}

/**
 * Generates a random ID for new products.
 */
export function createProductId(): string {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

/**
 * Column definition for CRUD table.
 */
export interface CrudColumn {
    field: string;
    header: string;
    customExportHeader?: string;
}

/**
 * Export column definition.
 */
export interface CrudExportColumn {
    title: string;
    dataKey: string;
}

/**
 * Default columns for the CRUD table.
 */
export const CRUD_TABLE_COLUMNS: CrudColumn[] = [
    { field: 'code', header: 'Code', customExportHeader: 'Product Code' },
    { field: 'name', header: 'Name' },
    { field: 'image', header: 'Image' },
    { field: 'price', header: 'Price' },
    { field: 'category', header: 'Category' }
];

/**
 * Creates export columns from table columns.
 */
export function createExportColumns(cols: CrudColumn[]): CrudExportColumn[] {
    return cols.map((col) => ({ title: col.header, dataKey: col.field }));
}
