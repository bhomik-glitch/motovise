// hooks/useOrders.ts — React Query hook for orders list
import { useQuery } from '@tanstack/react-query';
import { adminOrdersService } from '@/services/adminOrdersService';
import type { OrdersQueryParams } from '../orders.types';

export const ORDERS_QUERY_KEY = 'admin-orders';

export function useOrders(params: OrdersQueryParams) {
    return useQuery({
        queryKey: [ORDERS_QUERY_KEY, params],
        queryFn: () => adminOrdersService.getOrders(params),
        placeholderData: (prev) => prev, // keep previous data while re-fetching (no flicker on filter/page change)
    });
}
