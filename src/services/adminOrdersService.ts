// ─────────────────────────────────────────────────────────
// services/adminOrdersService.ts
// All API calls for the Admin Orders Management module.
// Uses the configured Axios client (with auth interceptors).
// ─────────────────────────────────────────────────────────

import apiClient from '@/lib/api';
import type {
    Order,
    OrdersQueryParams,
    OrdersResponse,
} from '@/modules/admin/orders/orders.types';

interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

export const adminOrdersService = {
    /**
     * Fetch paginated, filtered list of orders.
     * GET /v1/admin/orders
     */
    getOrders: async (params: OrdersQueryParams): Promise<OrdersResponse> => {
        // Strip empty string params to keep URL clean
        const cleanParams: Record<string, string | number> = {
            page: params.page,
            limit: params.limit,
        };
        if (params.status) cleanParams.status = params.status;
        if (params.riskLevel) cleanParams.riskLevel = params.riskLevel;
        if (params.paymentMethod) cleanParams.paymentMethod = params.paymentMethod;
        if (params.search?.trim()) cleanParams.search = params.search.trim();

        const response = await apiClient.get<ApiResponse<OrdersResponse>>(
            '/admin/orders',
            { params: cleanParams }
        );
        return response.data.data;
    },

    /**
     * Fetch full detail for a single order.
     * GET /admin/orders/:id
     */
    getOrderDetails: async (id: string): Promise<Order> => {
        const response = await apiClient.get<ApiResponse<Order>>(
            `/admin/orders/${id}`
        );
        return response.data.data;
    },

    /**
     * Cancel an order.
     * POST /admin/orders/:id/cancel
     */
    cancelOrder: async (id: string): Promise<void> => {
        await apiClient.post(`/admin/orders/${id}/cancel`);
    },

    /**
     * Mark an order as shipped.
     * POST /admin/orders/:id/ship
     */
    shipOrder: async (id: string): Promise<void> => {
        await apiClient.post(`/admin/orders/${id}/ship`);
    },

    /**
     * Approve a manual review.
     * POST /admin/manual-review/:orderId/approve
     */
    approveReview: async (orderId: string): Promise<void> => {
        await apiClient.post(`/admin/manual-review/${orderId}/approve`);
    },

    /**
     * Reject a manual review.
     * POST /admin/manual-review/:orderId/reject
     */
    rejectReview: async (orderId: string): Promise<void> => {
        await apiClient.post(`/admin/manual-review/${orderId}/reject`);
    },

    /**
     * Mark a review as called (outbound call logged).
     * POST /admin/manual-review/:orderId/mark-called
     */
    markCalled: async (orderId: string): Promise<void> => {
        await apiClient.post(`/admin/manual-review/${orderId}/mark-called`);
    },
};
