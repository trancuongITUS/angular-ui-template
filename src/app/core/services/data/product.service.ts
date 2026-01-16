import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface InventoryStatus {
    label: string;
    value: string;
}

export interface Product {
    id?: string;
    code?: string;
    name?: string;
    description?: string;
    price?: number;
    quantity?: number;
    inventoryStatus?: string;
    category?: string;
    image?: string;
    rating?: number;
}

export interface ProductWithOrders extends Product {
    orders?: ProductOrder[];
}

export interface ProductOrder {
    id?: string;
    productCode?: string;
    date?: string;
    amount?: number;
    quantity?: number;
    customer?: string;
    status?: string;
}

/**
 * Product data service for managing product catalog.
 * Mock data is loaded from fixtures for demo/testing purposes.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
    private readonly baseUrl = '/api/products';
    private productDataCache: Product[] | null = null;
    private productWithOrdersCache: ProductWithOrders[] | null = null;

    status: string[] = ['OUTOFSTOCK', 'INSTOCK', 'LOWSTOCK'];

    productNames: string[] = [
        'Bamboo Watch',
        'Black Watch',
        'Blue Band',
        'Blue T-Shirt',
        'Bracelet',
        'Brown Purse',
        'Chakra Bracelet',
        'Galaxy Earrings',
        'Game Controller',
        'Gaming Set',
        'Gold Phone Case',
        'Green Earbuds',
        'Green T-Shirt',
        'Grey T-Shirt',
        'Headphones',
        'Light Green T-Shirt',
        'Lime Band',
        'Mini Speakers',
        'Painted Phone Case',
        'Pink Band',
        'Pink Purse',
        'Purple Band',
        'Purple Gemstone Necklace',
        'Purple T-Shirt',
        'Shoes',
        'Sneakers',
        'Teal T-Shirt',
        'Yellow Earbuds',
        'Yoga Mat',
        'Yoga Set'
    ];

    constructor(private http: HttpClient) {}

    /**
     * Fetches products from the API.
     */
    getProductsFromApi(): Observable<Product[]> {
        return this.http.get<Product[]>(this.baseUrl);
    }

    /**
     * Loads product data from fixture file.
     */
    private async getProductsData(): Promise<Product[]> {
        if (this.productDataCache) {
            return this.productDataCache;
        }
        const module = await import('./fixtures/product-data.json');
        this.productDataCache = module.default as Product[];
        return this.productDataCache;
    }

    /**
     * Loads products with orders from fixture file.
     */
    private async getProductsWithOrdersData(): Promise<ProductWithOrders[]> {
        if (this.productWithOrdersCache) {
            return this.productWithOrdersCache;
        }
        const module = await import('./fixtures/product-with-orders-data.json');
        this.productWithOrdersCache = module.default as ProductWithOrders[];
        return this.productWithOrdersCache;
    }

    async getProductsMini(): Promise<Product[]> {
        const data = await this.getProductsData();
        return data.slice(0, 5);
    }

    async getProductsSmall(): Promise<Product[]> {
        const data = await this.getProductsData();
        return data.slice(0, 10);
    }

    async getProducts(): Promise<Product[]> {
        return this.getProductsData();
    }

    async getProductsWithOrdersSmall(): Promise<ProductWithOrders[]> {
        const data = await this.getProductsWithOrdersData();
        return data.slice(0, 10);
    }

    generateProduct(): Product {
        const product: Product = {
            id: this.generateId(),
            name: this.generateName(),
            description: 'Product Description',
            price: this.generatePrice(),
            quantity: this.generateQuantity(),
            category: 'Product Category',
            inventoryStatus: this.generateStatus(),
            rating: this.generateRating()
        };

        product.image = product.name?.toLocaleLowerCase().split(/[ ,]+/).join('-') + '.jpg';
        return product;
    }

    generateId(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    generateName(): string {
        return this.productNames[Math.floor(Math.random() * Math.floor(30))];
    }

    generatePrice(): number {
        return Math.floor(Math.random() * Math.floor(299) + 1);
    }

    generateQuantity(): number {
        return Math.floor(Math.random() * Math.floor(75) + 1);
    }

    generateStatus(): string {
        return this.status[Math.floor(Math.random() * Math.floor(3))];
    }

    generateRating(): number {
        return Math.floor(Math.random() * Math.floor(5) + 1);
    }
}
