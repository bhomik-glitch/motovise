import { useQuery } from '@tanstack/react-query';
import { adminProductsService } from '@/services/adminProductsService';

export const useCategories = () => {
    return useQuery({
        queryKey: ['admin-categories'],
        queryFn: () => adminProductsService.getCategories(),
    });
};
