/**
 * Returns severity tag for status display in table demo.
 * Maps various status strings to PrimeNG tag severities.
 */
export function getTableDemoSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
        case 'qualified':
        case 'instock':
        case 'INSTOCK':
        case 'DELIVERED':
        case 'delivered':
            return 'success';

        case 'negotiation':
        case 'lowstock':
        case 'LOWSTOCK':
        case 'PENDING':
        case 'pending':
            return 'warn';

        case 'unqualified':
        case 'outofstock':
        case 'OUTOFSTOCK':
        case 'CANCELLED':
        case 'cancelled':
            return 'danger';

        default:
            return 'info';
    }
}

/**
 * Formats currency value for display in table demo.
 */
export function formatTableDemoCurrency(value: number): string {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
