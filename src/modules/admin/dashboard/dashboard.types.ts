export interface DashboardMetrics {
    mtdGMV: number;
    ordersCount: number;
    prepaidPercentage: number;
    rtoRate: number;
    chargebackRate: number;
    avgShippingCost: number;
    manualReviewPending: number;
}

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface HighRiskPincode {
    pincode: string;
    rtoRate: number;
    totalOrders: number;
    riskLevel: RiskLevel;
}

export interface ActiveAlert {
    id: string; // Add an ID for mapping
    type: string;
    pincode: string;
    message: string;
    createdAt: string; // ISO string 
    isResolved?: boolean;
}

export interface DashboardData extends DashboardMetrics {
    highRiskPincodes: HighRiskPincode[];
    activeAlerts: ActiveAlert[];
}
