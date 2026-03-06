// ─────────────────────────────────────────────────────────
// modules/admin/payments/payments.types.ts
// All types for the Admin Payments Monitoring module.
// ─────────────────────────────────────────────────────────

export type PaymentGatewayStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export type PaymentGatewayMethod = 'COD' | 'RAZORPAY';

export interface Payment {
    id: string;
    orderId: string;
    userId: string;
    userEmail?: string;
    method: PaymentGatewayMethod;
    status: PaymentGatewayStatus;
    amount: number;
    shippingCost: number;
    chargeback: boolean;
    razorpayOrderId?: string;
    createdAt: string;
}

export interface PaymentAttempt {
    id: string;
    paymentId: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    status: PaymentGatewayStatus;
    errorCode?: string;
    gatewayResponse?: string;
    createdAt: string;
}

export interface PaymentsQueryParams {
    page: number;
    limit: number;
    status?: PaymentGatewayStatus | '';
    method?: PaymentGatewayMethod | '';
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}

export interface PaymentsResponse {
    data: Payment[];
    total: number;
    page: number;
    limit: number;
}
