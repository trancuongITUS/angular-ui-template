import { Observable, throwError } from 'rxjs';
import { ApiResponse, ApiErrorResponse } from './api-response.model';
import { LoggerService } from '@core/services';

/**
 * Extracts data from API response.
 */
export function extractApiData<T>(response: ApiResponse<T>): T {
    if (response.success) {
        return response.data;
    }
    throw new Error(response.message || 'API request failed');
}

/**
 * Determines if a request should be retried based on the error.
 * Only retry on network errors or 5xx server errors.
 */
export function shouldRetryRequest(error: { status?: number }): boolean {
    if (!error.status) {
        return true; // Network error
    }
    return error.status >= 500 && error.status < 600;
}

/**
 * Handles HTTP errors and transforms to consistent format.
 */
export function handleHttpError(error: { status?: number; message?: string; error?: { message?: string } }, method: string, url: string, logger: LoggerService): Observable<never> {
    logger.error(`HTTP ${method} Error [${url}]:`, error);

    const apiError: ApiErrorResponse = {
        success: false,
        error: {
            code: error.status?.toString() || 'UNKNOWN_ERROR',
            message: error.message || 'An unexpected error occurred'
        },
        message: error.error?.message || error.message || 'An unexpected error occurred',
        statusCode: error.status || 0,
        timestamp: new Date().toISOString(),
        path: url
    };

    return throwError(() => apiError);
}
