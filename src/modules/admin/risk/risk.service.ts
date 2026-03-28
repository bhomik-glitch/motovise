import api from '@/lib/api';
import { RiskPincode, FraudConfig, UpdateFraudConfigDto } from './risk.types';

interface ApiResponse<T> {
    data: T;
    success?: boolean;
}

export const riskService = {
    getRiskPincodes: async (): Promise<RiskPincode[]> => {
        const { data } = await api.get<ApiResponse<RiskPincode[]>>('/admin/risk/pincodes');
        return data.data;
    },

    getFraudConfig: async (): Promise<FraudConfig> => {
        const { data } = await api.get<ApiResponse<FraudConfig>>('/admin/config/fraud');
        return data.data;
    },

    updateFraudConfig: async (payload: UpdateFraudConfigDto): Promise<FraudConfig> => {
        const { data } = await api.patch<ApiResponse<FraudConfig>>('/admin/config/fraud', payload);
        return data.data;
    },
};
