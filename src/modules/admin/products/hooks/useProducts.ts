import { useQuery } from '@tanstack/react-query';
import { adminProductsService } from '@/services/adminProductsService';
import type { ProductsQueryParams, ProductsResponse } from '@/modules/admin/products/products.types';

export const useProducts = (params: ProductsQueryParams) => {
    return useQuery({
        queryKey: ['admin-products', params],
        queryFn: () => adminProductsService.getProducts(params),
        placeholderData: (prev) => prev, // keeps previous data while fetching
    });
};
