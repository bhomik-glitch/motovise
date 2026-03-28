import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';
import type { Product } from '@/types/product';

const fetchProductBySlug = async (slug: string): Promise<Product> => {
    console.log('Fetching product for slug:', slug);
    try {
        const { data } = await api.get<{ success: boolean; data: Product }>(`/products/${slug}`);
        console.log('API Response for', slug, ':', data);
        return data.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};

export function useProduct(slug: string) {
    return useQuery({
        queryKey: ['product', slug],
        queryFn: () => fetchProductBySlug(slug),
        enabled: !!slug,
        retry: false, // Don't retry infinitely if not found
    });
}
