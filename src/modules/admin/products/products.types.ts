export type ProductStatus = "ACTIVE" | "INACTIVE";

export interface Category {
    id: string;
    name: string;
    slug?: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    status: ProductStatus;
    category: {
        id: string;
        name: string;
    };
    categoryId: string;
    images?: string[];
    thumbnail?: string;
    createdAt: string;
}

export interface ProductsQueryParams {
    page: number;
    limit: number;
    status?: string;
    categoryId?: string;
    search?: string;
}

export interface ProductsResponse {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CreateProductPayload {
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
}

export interface UpdateProductPayload {
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    categoryId?: string;
}
