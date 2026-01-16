import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Country {
    name?: string;
    code?: string;
}

export interface Representative {
    name?: string;
    image?: string;
}

export interface Customer {
    id?: number;
    name?: string;
    country?: Country;
    company?: string;
    date?: string;
    status?: string;
    activity?: number;
    representative?: Representative;
    verified?: boolean;
    balance?: number;
}

/**
 * Customer data service for managing customer records.
 * Mock data is loaded from fixtures for demo/testing purposes.
 */
@Injectable({ providedIn: 'root' })
export class CustomerService {
    private readonly baseUrl = '/api/customers';
    private mockDataCache: Customer[] | null = null;

    constructor(private http: HttpClient) {}

    /**
     * Fetches customers from the API with optional query parameters.
     */
    getCustomers(params?: Record<string, unknown>): Observable<Customer[]> {
        return this.http.get<Customer[]>(this.baseUrl, { params: params as Record<string, string> });
    }

    /**
     * Loads mock data from fixture file for demo/testing purposes.
     * Uses dynamic import to avoid bundling large data in main chunk.
     */
    private async getMockData(): Promise<Customer[]> {
        if (this.mockDataCache) {
            return this.mockDataCache;
        }
        const module = await import('./fixtures/customer-mock-data.json');
        this.mockDataCache = module.default as Customer[];
        return this.mockDataCache;
    }

    /**
     * Returns first 5 customers from mock data.
     */
    async getCustomersMini(): Promise<Customer[]> {
        const data = await this.getMockData();
        return data.slice(0, 5);
    }

    /**
     * Returns first 10 customers from mock data.
     */
    async getCustomersSmall(): Promise<Customer[]> {
        const data = await this.getMockData();
        return data.slice(0, 10);
    }

    /**
     * Returns first 50 customers from mock data.
     */
    async getCustomersMedium(): Promise<Customer[]> {
        const data = await this.getMockData();
        return data.slice(0, 50);
    }

    /**
     * Returns first 200 customers from mock data.
     */
    async getCustomersLarge(): Promise<Customer[]> {
        const data = await this.getMockData();
        return data.slice(0, 200);
    }

    /**
     * Returns all customers from mock data.
     */
    async getCustomersXLarge(): Promise<Customer[]> {
        return this.getMockData();
    }
}
