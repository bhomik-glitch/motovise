
export enum RiskLevel {
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
}

export interface PincodeRiskData {
    pincode: string;
    totalOrders30d: number;
    rtoCount30d: number;
    rtoPercentage: number;
    riskLevel: RiskLevel;
    lastUpdated: Date;
}
