// hooks/useOrderMutations.ts — React Query mutations for order lifecycle actions
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrdersService } from '@/services/adminOrdersService';
import { ORDERS_QUERY_KEY } from './useOrders';

function useInvalidateOrders() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
    };
}

export function useCancelOrder() {
    const invalidate = useInvalidateOrders();
    return useMutation({
        mutationFn: (id: string) => adminOrdersService.cancelOrder(id),
        onSuccess: invalidate,
    });
}

export function useShipOrder() {
    const invalidate = useInvalidateOrders();
    return useMutation({
        mutationFn: (id: string) => adminOrdersService.shipOrder(id),
        onSuccess: invalidate,
    });
}

export function useApproveReview() {
    const invalidate = useInvalidateOrders();
    return useMutation({
        mutationFn: (orderId: string) => adminOrdersService.approveReview(orderId),
        onSuccess: invalidate,
    });
}

export function useRejectReview() {
    const invalidate = useInvalidateOrders();
    return useMutation({
        mutationFn: (orderId: string) => adminOrdersService.rejectReview(orderId),
        onSuccess: invalidate,
    });
}

export function useMarkCalled() {
    const invalidate = useInvalidateOrders();
    return useMutation({
        mutationFn: (orderId: string) => adminOrdersService.markCalled(orderId),
        onSuccess: invalidate,
    });
}
