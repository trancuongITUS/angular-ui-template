/**
 * Shared severity utility functions for consistent status styling.
 * Maps various status strings to PrimeNG tag severities.
 */

/** PrimeNG Tag severity type */
export type TagSeverity = 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast';

/** Status values that map to 'success' severity */
const SUCCESS_STATUSES = new Set([
    'instock', 'INSTOCK',
    'qualified',
    'delivered', 'DELIVERED',
    'active', 'ACTIVE',
    'completed', 'COMPLETED',
    'approved', 'APPROVED'
]);

/** Status values that map to 'warn' severity */
const WARNING_STATUSES = new Set([
    'lowstock', 'LOWSTOCK',
    'negotiation',
    'pending', 'PENDING',
    'review', 'REVIEW',
    'processing', 'PROCESSING'
]);

/** Status values that map to 'danger' severity */
const DANGER_STATUSES = new Set([
    'outofstock', 'OUTOFSTOCK',
    'unqualified',
    'cancelled', 'CANCELLED',
    'rejected', 'REJECTED',
    'failed', 'FAILED',
    'expired', 'EXPIRED'
]);

/**
 * Returns PrimeNG Tag severity for a given status string.
 * Handles inventory status, customer status, order status, and common app statuses.
 *
 * @param status - The status string to map to a severity
 * @returns The PrimeNG Tag severity
 *
 * @example
 * ```typescript
 * getStatusSeverity('INSTOCK');     // 'success'
 * getStatusSeverity('qualified');   // 'success'
 * getStatusSeverity('LOWSTOCK');    // 'warn'
 * getStatusSeverity('CANCELLED');   // 'danger'
 * getStatusSeverity('new');         // 'info' (default)
 * ```
 */
export function getStatusSeverity(status: string | undefined | null): TagSeverity {
    if (!status) {
        return 'info';
    }

    const normalizedStatus = status.trim();

    if (SUCCESS_STATUSES.has(normalizedStatus)) {
        return 'success';
    }

    if (WARNING_STATUSES.has(normalizedStatus)) {
        return 'warn';
    }

    if (DANGER_STATUSES.has(normalizedStatus)) {
        return 'danger';
    }

    return 'info';
}

/**
 * Returns severity specifically for inventory status.
 * Alias for getStatusSeverity with inventory-specific typing.
 *
 * @param status - Inventory status (INSTOCK, LOWSTOCK, OUTOFSTOCK)
 * @returns The PrimeNG Tag severity
 */
export function getInventorySeverity(status: 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK' | string): TagSeverity {
    return getStatusSeverity(status);
}
