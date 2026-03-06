// hooks/usePayments.ts — React Query hook for payments list
import { useQuery } from '@tanstack/react-query';
import { adminPaymentsService } from '@/services/adminPaymentsService';
import type { PaymentsQueryParams, PaymentGatewayStatus, PaymentGatewayMethod } from '../payments.types';

export const PAYMENTS_QUERY_KEY = 'admin-payments';

export function usePayments(params: PaymentsQueryParams) {
    // Flatten params into the query key so React Query cache is object-reference stable
    return useQuery({
        queryKey: [
            PAYMENTS_QUERY_KEY,
            params.page,
            params.limit,
            params.status as PaymentGatewayStatus | '' | undefined,
            params.method as PaymentGatewayMethod | '' | undefined,
            params.dateFrom ?? '',
            params.dateTo ?? '',
            params.search ?? '',
        ],
        queryFn: () => adminPaymentsService.getPayments(params),
        placeholderData: (prev) => prev, // prevents table flicker on filter / page changes
    });
}
