import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminManualReviewService } from '@/services/adminManualReviewService';
import { QUERY_KEYS } from '../manualReview.types';
import toast from 'react-hot-toast';

export function useRejectReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: string) => adminManualReviewService.rejectReview(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.manualReviewQueue });
            toast.success('Review rejected successfully');
        },
        onError: () => {
            toast.error('Failed to reject review. Please retry.');
        },
    });
}
