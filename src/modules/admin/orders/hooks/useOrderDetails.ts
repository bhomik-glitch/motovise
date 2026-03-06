// hooks/useOrderDetails.ts — React Query hook for single order detail
import { useQuery } from '@tanstack/react-query';
import { adminOrdersService } from '@/services/adminOrdersService';
import { ORDERS_QUERY_KEY } from './useOrders';

export function useOrderDetails(id: string | null) {
    return useQuery({
        queryKey: [ORDERS_QUERY_KEY, 'detail', id],
        queryFn: () => adminOrdersService.getOrderDetails(id!),
        enabled: !!id,
    });
}
