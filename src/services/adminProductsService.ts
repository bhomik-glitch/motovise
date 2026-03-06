import apiClient from '@/lib/api';
import type {
    Product,
    ProductsQueryParams,
    ProductsResponse,
    Category,
    CreateProductPayload,
    UpdateProductPayload,
} from '@/modules/admin/products/products.types';

interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

export const adminProductsService = {
    getProducts: async (params: ProductsQueryParams): Promise<ProductsResponse> => {
        const cleanParams: Record<string, string | number> = {
            page: params.page,
            limit: params.limit,
        };
        if (params.status) cleanParams.status = params.status;
        if (params.categoryId) cleanParams.categoryId = params.categoryId;
        if (params.search?.trim()) cleanParams.search = params.search.trim();

        // Use /products instead of admin
        const response = await apiClient.get<ApiResponse<ProductsResponse | Product[]>>(
            '/products',
            { params: cleanParams }
        );

        // some APIs return an array instead of paginated response, handle gracefully
        if (Array.isArray(response.data.data)) {
            return {
                data: response.data.data,
                total: response.data.data.length,
                page: 1,
                limit: 100,
                totalPages: 1
            }
        }

        return response.data.data as ProductsResponse;
    },

    getCategories: async (): Promise<Category[]> => {
        const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
        return response.data.data;
    },

    createProduct: async (data: CreateProductPayload): Promise<Product> => {
        const payload = { ...data, price: Number(data.price), stock: Number(data.stock) };
        const response = await apiClient.post<ApiResponse<Product>>('/products', payload);
        return response.data.data;
    },

    updateProduct: async (id: string, data: UpdateProductPayload): Promise<Product> => {
        const payload = { ...data };
        if (payload.price !== undefined) {
            payload.price = Number(payload.price);
        }
        const response = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, payload);
        return response.data.data;
    },

    updateStock: async (id: string, stock: number): Promise<void> => {
        // Backend doesn't have /stock endpoint in generic controller, assume update or wait
        // Based on Phase 5 details, it is just PATCH /products/:id with updated body
        await apiClient.patch(`/products/${id}`, { stock: Number(stock) });
    },

    toggleStatus: async (id: string, currentStatus: string): Promise<void> => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await apiClient.patch(`/products/${id}`, { status: newStatus });
    },
};
