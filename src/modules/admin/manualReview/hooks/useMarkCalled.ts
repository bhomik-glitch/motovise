import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminManualReviewService } from '@/services/adminManualReviewService';
import { QUERY_KEYS } from '../manualReview.types';
import toast from 'react-hot-toast';

export function useMarkCalled() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: string) => adminManualReviewService.markCalled(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.manualReviewQueue });
            toast.success('Order marked as called');
        },
        onError: () => {
            toast.error('Failed to mark order as called. Please retry.');
        },
    });
}
