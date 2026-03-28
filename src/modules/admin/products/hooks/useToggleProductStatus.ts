import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProductsService } from '@/services/adminProductsService';
import toast from 'react-hot-toast';

export const useToggleProductStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, currentStatus }: { id: string; currentStatus: string }) =>
            adminProductsService.toggleStatus(id, currentStatus),
        onSuccess: () => {
            toast.success('Product status updated successfully');
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        },
        onError: (error: unknown) => {
            const msg = (error as any)?.response?.data?.message || 'Failed to update product status';
            toast.error(msg);
        },
    });
};
