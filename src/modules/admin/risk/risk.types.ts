export interface RiskPincode {
    pincode: string;
    totalOrders: number;
    rtoRate: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface FraudConfig {
    codEnforcement: 'DISABLE' | 'FLAG';
    rtoThreshold: number;
}

export interface UpdateFraudConfigDto {
    codEnforcement: 'DISABLE' | 'FLAG';
}
