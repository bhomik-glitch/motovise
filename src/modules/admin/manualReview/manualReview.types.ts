export const QUERY_KEYS = {
    manualReviewQueue: ['manualReviewQueue'],
};

export type ManualReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CALLED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type PaymentMethod = 'PREPAID' | 'COD' | 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';

export interface RuleContribution {
    ruleName: string;
    points: number;
}

export interface ManualReviewQueueItem {
    id: string; // Order ID
    orderNumber: string;
    customerName: string;
    customerEmail?: string;
    fraudScore: number;
    riskLevel: RiskLevel;
    ruleTriggerCount: number;
    createdAt: string;
    status: ManualReviewStatus;

    // Details for modal breakdown
    ruleContributions: RuleContribution[];
    orderValue: number;
    paymentMethod: PaymentMethod;
    shippingPincode?: string;
    chargebackHistory?: boolean;
    customerOrderCount?: number;
}

export interface ManualReviewQueryParams {
    page: number;
    limit: number;
}

export interface ManualReviewQueueResponse {
    data: ManualReviewQueueItem[];
    total: number;
    page: number;
    limit: number;
}
