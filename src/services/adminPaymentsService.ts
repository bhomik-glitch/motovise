// ─────────────────────────────────────────────────────────
// services/adminPaymentsService.ts
// All API calls for the Admin Payments Monitoring module.
// READ-ONLY — no mutation endpoints.
// ─────────────────────────────────────────────────────────

import apiClient from '@/lib/api';
import type {
    PaymentsQueryParams,
    PaymentsResponse,
    PaymentAttempt,
} from '@/modules/admin/payments/payments.types';

interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

export const adminPaymentsService = {
    /**
     * Fetch paginated, filtered list of payment records.
     * GET /v1/admin/payments
     */
    getPayments: async (params: PaymentsQueryParams): Promise<PaymentsResponse> => {
        const cleanParams: Record<string, string | number> = {
            page: params.page,
            limit: params.limit,
        };
        if (params.status) cleanParams.status = params.status;
        if (params.method) cleanParams.method = params.method;
        if (params.dateFrom) cleanParams.dateFrom = params.dateFrom;
        if (params.dateTo) cleanParams.dateTo = params.dateTo;
        if (params.search?.trim()) cleanParams.search = params.search.trim();

        const response = await apiClient.get<ApiResponse<PaymentsResponse>>(
            '/admin/payments',
            { params: cleanParams }
        );

        // If double-nested by the interceptor or backend:
        const responseData = response.data as any;
        if (responseData.data && responseData.data.data !== undefined) {
            return responseData.data;
        }

        return response.data.data;
    },

    /**
     * Fetch all payment attempts for a given payment record.
     * GET /admin/payments/:paymentId/attempts
     */
    getPaymentAttempts: async (paymentId: string): Promise<PaymentAttempt[]> => {
        const response = await apiClient.get<ApiResponse<PaymentAttempt[]>>(
            `/admin/payments/${paymentId}/attempts`
        );
        return response.data.data;
    },
};
