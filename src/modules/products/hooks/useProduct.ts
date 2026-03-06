import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';
import type { Product } from '@/types/product';

const fetchProductBySlug = async (slug: string): Promise<Product> => {
    const { data } = await api.get<{ success: boolean; data: Product }>(`/products/slug/${slug}`);
    return data.data;
};

export function useProduct(slug: string) {
    return useQuery({
        queryKey: ['product', slug],
        queryFn: () => fetchProductBySlug(slug),
        enabled: !!slug,
    });
}
