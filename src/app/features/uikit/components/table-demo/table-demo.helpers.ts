import { getStatusSeverity, TagSeverity } from '@shared/utils/severity.utils';

/**
 * Returns severity tag for status display in table demo.
 * @deprecated Use getStatusSeverity from '@shared/utils' directly
 */
export function getTableDemoSeverity(status: string): TagSeverity {
    return getStatusSeverity(status);
}

/**
 * Formats currency value for display in table demo.
 */
export function formatTableDemoCurrency(value: number): string {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
