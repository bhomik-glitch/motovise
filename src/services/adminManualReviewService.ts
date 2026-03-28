import api from '@/lib/api';
import type { ManualReviewQueryParams, ManualReviewQueueResponse, ManualReviewQueueItem } from '@/modules/admin/manualReview/manualReview.types';

export const adminManualReviewService = {
    /** GET /admin/manual-review */
    async getManualReviewQueue(params: ManualReviewQueryParams): Promise<ManualReviewQueueResponse> {
        const query = new URLSearchParams({
            page: String(params.page),
            limit: String(params.limit),
        });
        const { data } = await api.get<ManualReviewQueueResponse>(`/admin/manual-review?${query.toString()}`);
        return data;
    },

    /** PATCH /admin/manual-review/{orderId}/approve */
    async approveReview(orderId: string): Promise<ManualReviewQueueItem> {
        const { data } = await api.patch<ManualReviewQueueItem>(`/admin/manual-review/${orderId}/approve`);
        return data;
    },

    /** PATCH /admin/manual-review/{orderId}/reject */
    async rejectReview(orderId: string): Promise<ManualReviewQueueItem> {
        const { data } = await api.patch<ManualReviewQueueItem>(`/admin/manual-review/${orderId}/reject`);
        return data;
    },

    /** PATCH /admin/manual-review/{orderId}/mark-called */
    async markCalled(orderId: string): Promise<ManualReviewQueueItem> {
        const { data } = await api.patch<ManualReviewQueueItem>(`/admin/manual-review/${orderId}/mark-called`);
        return data;
    },
};
