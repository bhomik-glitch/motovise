// hooks/usePaymentAttempts.ts — React Query hook for payment attempts modal
import { useQuery } from '@tanstack/react-query';
import { adminPaymentsService } from '@/services/adminPaymentsService';

export const PAYMENT_ATTEMPTS_QUERY_KEY = 'payment-attempts';

/**
 * Fetches payment attempts for a given paymentId.
 * Automatically disabled when paymentId is null — safe to pass null when modal is closed.
 * Set selectedPaymentId to null on modal close to clear stale data.
 */
export function usePaymentAttempts(paymentId: string | null) {
    return useQuery({
        queryKey: [PAYMENT_ATTEMPTS_QUERY_KEY, paymentId],
        queryFn: () => adminPaymentsService.getPaymentAttempts(paymentId!),
        enabled: !!paymentId, // only fires when modal is open
    });
}
