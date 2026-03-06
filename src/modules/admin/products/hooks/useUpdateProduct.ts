import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProductsService } from '@/services/adminProductsService';
import type { UpdateProductPayload } from '@/modules/admin/products/products.types';
import toast from 'react-hot-toast';

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
            adminProductsService.updateProduct(id, data),
        onSuccess: () => {
            toast.success('Product updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Failed to update product';
            toast.error(msg);
        },
    });
};

export const useUpdateStock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, stock }: { id: string; stock: number }) =>
            adminProductsService.updateStock(id, stock),
        onSuccess: () => {
            toast.success('Stock updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Failed to update stock';
            toast.error(msg);
        },
    });
};
