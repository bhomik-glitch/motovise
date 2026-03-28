import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';
import type { ProductListResponse } from '@/types/product';
import type { FilterState } from '../components/FilterSidebar';
import type { SortOption } from '../components/SortDropdown';

interface UseProductsOptions {
    page: number;
    sort: SortOption;
    filters: FilterState;
    search?: string;
}

/** Map frontend SortOption to backend sortBy + sortOrder params */
function mapSort(sort: SortOption): { sortBy: string; sortOrder: 'asc' | 'desc' } {
    switch (sort) {
        case 'price-asc': return { sortBy: 'price', sortOrder: 'asc' };
        case 'price-desc': return { sortBy: 'price', sortOrder: 'desc' };
        case 'rating-desc':
        case 'newest':
        default: return { sortBy: 'createdAt', sortOrder: 'desc' };
    }
}

const fetchProducts = async (options: UseProductsOptions): Promise<ProductListResponse> => {
    const { sortBy, sortOrder } = mapSort(options.sort);

    const params: any = {
        page: options.page,
        limit: 12,
        sortBy,
        sortOrder,
        isActive: true,
    };

    if (options.search) params.search = options.search;
    if (options.filters.categories && options.filters.categories.length > 0) {
        params.categoryId = options.filters.categories[0];
    }
    if (options.filters.minPrice !== undefined) params.minPrice = options.filters.minPrice;
    if (options.filters.maxPrice !== undefined) params.maxPrice = options.filters.maxPrice;

    const { data } = await api.get<{ success: boolean; data: ProductListResponse }>('/products', { params });
    const payload = data.data;

    // Add legacy aliases so the products page works without further changes
    return {
        ...payload,
        products: payload.data,
        total: payload.meta.total,
        page: payload.meta.page,
        limit: payload.meta.limit,
    };
};

export function useProducts(options: UseProductsOptions) {
    return useQuery({
        queryKey: ['products', options],
        queryFn: () => fetchProducts(options),
        placeholderData: (prev) => prev,
    });
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export function useCategories() {
    return useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get<{ success: boolean; data: Category[] }>('/categories');
            return data.data.map(c => ({ id: c.id, name: c.name, slug: c.slug }));
        },
        staleTime: 60000 * 5,
    });
}

export function useFeaturedProducts() {
    return useQuery({
        queryKey: ['products', 'featured'],
        queryFn: async () => {
            const { data } = await api.get<{ success: boolean; data: any }>('/products', {
                params: { isFeatured: true, isActive: true, limit: 6 }
            });
            return data.data.data;
        },
    });
}

