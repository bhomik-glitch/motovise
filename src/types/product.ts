export interface ProductCategory {
    id: string;
    name: string;
    slug: string;
}

// Feature item as returned from the backend JSON field
export interface ProductFeature {
    icon?: string;
    title: string;
    description: string;
}

// Compatibility info
export interface ProductCompatibility {
    makes?: string[];
    years?: { from: number; to: number };
    note?: string;
}

// Specification row
export interface ProductSpecification {
    label: string;
    value: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
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
    // Rich product fields
    features: ProductFeature[] | null;
    compatibility: ProductCompatibility | null;
    specifications: ProductSpecification[] | null;
    boxContents: string[];
    isComingSoon?: boolean;
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
