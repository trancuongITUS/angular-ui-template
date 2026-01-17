import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpContext } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { AppConfigService } from '@core/config/app-config.service';
import { LoggerService } from '@core/services';
import { ApiResponse, PaginatedResponse, PaginationParams, SearchParams, ListResponse, EmptyResponse } from './api-response.model';
import { buildPaginationParams, buildSearchParams, mergeOptions } from './http-params-builder';
import { extractApiData, shouldRetryRequest, handleHttpError } from './http-error-handler';

/**
 * HTTP request options interface.
 */
export interface HttpRequestOptions {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
    context?: HttpContext;
    observe?: 'body';
    reportProgress?: boolean;
    responseType?: 'json';
    withCredentials?: boolean;
}

/**
 * Base HTTP service that wraps Angular's HttpClient.
 * Provides a consistent interface for making API calls with automatic error handling,
 * retry logic, and response transformation.
 */
@Injectable({
    providedIn: 'root'
})
export class BaseHttpService {
    private readonly http = inject(HttpClient);
    private readonly config = inject(AppConfigService);
    private readonly logger = inject(LoggerService);

    /**
     * Performs a GET request.
     */
    get<T>(url: string, options?: HttpRequestOptions): Observable<T> {
        const fullUrl = this.buildUrl(url);
        this.logRequest('GET', fullUrl, options);

        return this.http.get<ApiResponse<T>>(fullUrl, options).pipe(
            timeout(this.config.apiTimeout),
            retry({
                count: this.config.apiRetryAttempts,
                delay: (error, retryCount) => (shouldRetryRequest(error) ? timer(this.config.apiRetryDelay * retryCount) : throwError(() => error))
            }),
            map((response) => extractApiData<T>(response)),
            catchError((error) => handleHttpError(error, 'GET', fullUrl, this.logger))
        );
    }

    /**
     * Performs a GET request that returns a list of items.
     */
    getList<T>(url: string, options?: HttpRequestOptions): Observable<T[]> {
        const fullUrl = this.buildUrl(url);
        this.logRequest('GET', fullUrl, options);

        return this.http.get<ListResponse<T>>(fullUrl, options).pipe(
            timeout(this.config.apiTimeout),
            retry({
                count: this.config.apiRetryAttempts,
                delay: (error, retryCount) => (shouldRetryRequest(error) ? timer(this.config.apiRetryDelay * retryCount) : throwError(() => error))
            }),
            map((response) => response.data),
            catchError((error) => handleHttpError(error, 'GET', fullUrl, this.logger))
        );
    }

    /**
     * Performs a GET request that returns paginated data.
     */
    getPaginated<T>(url: string, params?: PaginationParams, options?: HttpRequestOptions): Observable<PaginatedResponse<T>> {
        const fullUrl = this.buildUrl(url);
        const httpParams = buildPaginationParams(params);
        const mergedOptions = mergeOptions(options, { params: httpParams });

        this.logRequest('GET', fullUrl, mergedOptions);

        return this.http.get<PaginatedResponse<T>>(fullUrl, mergedOptions).pipe(
            timeout(this.config.apiTimeout),
            retry({
                count: this.config.apiRetryAttempts,
                delay: (error, retryCount) => (shouldRetryRequest(error) ? timer(this.config.apiRetryDelay * retryCount) : throwError(() => error))
            }),
            catchError((error) => handleHttpError(error, 'GET', fullUrl, this.logger))
        );
    }

    /**
     * Performs a GET request with search and filter capabilities.
     */
    search<T>(url: string, params?: SearchParams, options?: HttpRequestOptions): Observable<PaginatedResponse<T>> {
        const fullUrl = this.buildUrl(url);
        const httpParams = buildSearchParams(params);
        const mergedOptions = mergeOptions(options, { params: httpParams });

        this.logRequest('GET', fullUrl, mergedOptions);

        return this.http.get<PaginatedResponse<T>>(fullUrl, mergedOptions).pipe(
            timeout(this.config.apiTimeout),
            retry({
                count: this.config.apiRetryAttempts,
                delay: (error, retryCount) => (shouldRetryRequest(error) ? timer(this.config.apiRetryDelay * retryCount) : throwError(() => error))
            }),
            catchError((error) => handleHttpError(error, 'GET', fullUrl, this.logger))
        );
    }

    /**
     * Performs a POST request.
     */
    post<T>(url: string, body: unknown, options?: HttpRequestOptions): Observable<T> {
        const fullUrl = this.buildUrl(url);
        this.logRequest('POST', fullUrl, options, body);

        return this.http.post<ApiResponse<T>>(fullUrl, body, options).pipe(
            timeout(this.config.apiTimeout),
            map((response) => extractApiData<T>(response)),
            catchError((error) => handleHttpError(error, 'POST', fullUrl, this.logger))
        );
    }

    /**
     * Performs a PUT request.
     */
    put<T>(url: string, body: unknown, options?: HttpRequestOptions): Observable<T> {
        const fullUrl = this.buildUrl(url);
        this.logRequest('PUT', fullUrl, options, body);

        return this.http.put<ApiResponse<T>>(fullUrl, body, options).pipe(
            timeout(this.config.apiTimeout),
            map((response) => extractApiData<T>(response)),
            catchError((error) => handleHttpError(error, 'PUT', fullUrl, this.logger))
        );
    }

    /**
     * Performs a PATCH request.
     */
    patch<T>(url: string, body: unknown, options?: HttpRequestOptions): Observable<T> {
        const fullUrl = this.buildUrl(url);
        this.logRequest('PATCH', fullUrl, options, body);

        return this.http.patch<ApiResponse<T>>(fullUrl, body, options).pipe(
            timeout(this.config.apiTimeout),
            map((response) => extractApiData<T>(response)),
            catchError((error) => handleHttpError(error, 'PATCH', fullUrl, this.logger))
        );
    }

    /**
     * Performs a DELETE request.
     */
    delete(url: string, options?: HttpRequestOptions): Observable<void> {
        const fullUrl = this.buildUrl(url);
        this.logRequest('DELETE', fullUrl, options);

        return this.http.delete<EmptyResponse>(fullUrl, options).pipe(
            timeout(this.config.apiTimeout),
            map(() => undefined),
            catchError((error) => handleHttpError(error, 'DELETE', fullUrl, this.logger))
        );
    }

    /**
     * Performs a DELETE request that returns data.
     */
    deleteWithResponse<T>(url: string, options?: HttpRequestOptions): Observable<T> {
        const fullUrl = this.buildUrl(url);
        this.logRequest('DELETE', fullUrl, options);

        return this.http.delete<ApiResponse<T>>(fullUrl, options).pipe(
            timeout(this.config.apiTimeout),
            map((response) => extractApiData<T>(response)),
            catchError((error) => handleHttpError(error, 'DELETE', fullUrl, this.logger))
        );
    }

    /**
     * Builds the full URL from a relative or absolute path.
     */
    private buildUrl(url: string): string {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
        return `${this.config.api.baseUrl}/${this.config.api.version}/${cleanUrl}`;
    }

    /**
     * Logs HTTP requests in development mode.
     */
    private logRequest(method: string, url: string, options?: HttpRequestOptions, body?: unknown): void {
        if (!this.config.debugEnabled) {
            return;
        }
        this.logger.debug(`HTTP ${method} Request:`, { url, options, body });
    }
}
