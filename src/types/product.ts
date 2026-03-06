export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    sku: string | null;
    stock: number;
    images: string[];
    thumbnail: string | null;
    isActive: boolean;
    isFeatured: boolean;
    categoryId: string | null;
    category: ProductCategory | null;
    metaTitle: string | null;
    metaDescription: string | null;
    createdAt: string;
    updatedAt: string;
    // Legacy / convenience
    currency?: string;
    attributes?: Record<string, any>;
}

export interface ProductListMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ProductListResponse {
    /** products list returned under the `data` key from backend */
    data: Product[];
    meta: ProductListMeta;
    // legacy aliases used by older frontend code
    products?: Product[];
    total?: number;
    page?: number;
    limit?: number;
}
