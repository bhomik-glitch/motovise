import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProductsService } from '@/services/adminProductsService';
import type { CreateProductPayload } from '@/modules/admin/products/products.types';
import toast from 'react-hot-toast';

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductPayload) => adminProductsService.createProduct(data),
        onSuccess: () => {
            toast.success('Product created successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || error.message || 'Failed to create product';
            // If backend rejects duplicate slug
            if (msg.toLowerCase().includes('slug')) {
                toast.error(`Slug error: ${msg}`);
            } else {
                toast.error(msg);
            }
        },
    });
};
