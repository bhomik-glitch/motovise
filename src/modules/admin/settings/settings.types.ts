export interface SystemConfig {
    codThreshold: number;
    fraudThreshold: number;
    alertThreshold: number;
    enforcementMode: 'DISABLE' | 'FLAG';
}

export interface UpdateSystemConfigDto {
    codThreshold?: number;
    fraudThreshold?: number;
    alertThreshold?: number;
    enforcementMode?: 'DISABLE' | 'FLAG';
}
