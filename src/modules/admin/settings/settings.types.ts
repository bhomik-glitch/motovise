export interface SystemConfig {
    maxLoginAttempts: number;
    fraudRiskThreshold: number;
    enableEmailVerification: boolean;
}

export interface UpdateSystemConfigDto {
    maxLoginAttempts?: number;
    fraudRiskThreshold?: number;
    enableEmailVerification?: boolean;
}
