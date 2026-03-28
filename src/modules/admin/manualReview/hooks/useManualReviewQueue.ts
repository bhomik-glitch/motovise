import { useQuery } from '@tanstack/react-query';
import { adminManualReviewService } from '@/services/adminManualReviewService';
import { QUERY_KEYS, type ManualReviewQueryParams } from '../manualReview.types';

export function useManualReviewQueue(params: ManualReviewQueryParams) {
    return useQuery({
        queryKey: [...QUERY_KEYS.manualReviewQueue, params],
        queryFn: () => adminManualReviewService.getManualReviewQueue(params),
        placeholderData: (prev) => prev, // Keeps old data while fetching next page
    });
}
