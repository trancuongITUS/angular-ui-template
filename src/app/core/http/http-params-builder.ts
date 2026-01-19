import { HttpParams, HttpHeaders } from '@angular/common/http';
import { PaginationParams, SearchParams } from './api-response.model';
import { HttpRequestOptions } from './base-http.service';

/**
 * Builds HTTP params from pagination parameters.
 */
export function buildPaginationParams(params?: PaginationParams): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
        if (params.page !== undefined) {
            httpParams = httpParams.set('page', params.page.toString());
        }
        if (params.pageSize !== undefined) {
            httpParams = httpParams.set('pageSize', params.pageSize.toString());
        }
        if (params.sortBy) {
            httpParams = httpParams.set('sortBy', params.sortBy);
        }
        if (params.sortOrder) {
            httpParams = httpParams.set('sortOrder', params.sortOrder);
        }
    }

    return httpParams;
}

/**
 * Builds HTTP params from search parameters including filters.
 */
export function buildSearchParams(params?: SearchParams): HttpParams {
    let httpParams = buildPaginationParams(params);

    if (params) {
        if (params.search) {
            httpParams = httpParams.set('search', params.search);
        }
        if (params.filters) {
            Object.entries(params.filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    httpParams = httpParams.set(key, String(value));
                }
            });
        }
    }

    return httpParams;
}

/**
 * Merges request options.
 */
export function mergeOptions(options?: HttpRequestOptions, additionalOptions?: HttpRequestOptions): HttpRequestOptions {
    if (!additionalOptions) {
        return options || {};
    }

    return {
        ...options,
        ...additionalOptions,
        headers: mergeHeaders(options?.headers, additionalOptions.headers),
        params: mergeParams(options?.params, additionalOptions.params)
    };
}

/**
 * Merges HTTP headers.
 */
export function mergeHeaders(
    headers1?: HttpHeaders | { [header: string]: string | string[] },
    headers2?: HttpHeaders | { [header: string]: string | string[] }
): HttpHeaders {
    let merged = new HttpHeaders(headers1);
    if (headers2) {
        if (headers2 instanceof HttpHeaders) {
            headers2.keys().forEach((key) => {
                const values = headers2.getAll(key);
                if (values) {
                    merged = merged.set(key, values);
                }
            });
        } else {
            Object.entries(headers2).forEach(([key, value]) => {
                merged = merged.set(key, value);
            });
        }
    }
    return merged;
}

/**
 * Merges HTTP params.
 */
export function mergeParams(
    params1?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> },
    params2?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }
): HttpParams {
    let merged = new HttpParams({ fromObject: params1 as Record<string, string> });
    if (params2) {
        if (params2 instanceof HttpParams) {
            params2.keys().forEach((key) => {
                const values = params2.getAll(key);
                if (values) {
                    merged = merged.set(key, values);
                }
            });
        } else {
            Object.entries(params2).forEach(([key, value]) => {
                merged = merged.set(key, String(value));
            });
        }
    }
    return merged;
}
