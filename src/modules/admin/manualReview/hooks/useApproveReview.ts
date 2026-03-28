import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminManualReviewService } from '@/services/adminManualReviewService';
import { QUERY_KEYS } from '../manualReview.types';
import toast from 'react-hot-toast';

export function useApproveReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: string) => adminManualReviewService.approveReview(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.manualReviewQueue });
            toast.success('Review approved successfully');
        },
        onError: () => {
            toast.error('Failed to approve review. Please retry.');
        },
    });
}
