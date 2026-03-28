import apiClient from '@/lib/api';
import { SystemConfig, UpdateSystemConfigDto } from '@/modules/admin/settings/settings.types';

interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

export const adminSettingsService = {
    async getSystemConfig(): Promise<SystemConfig> {
        const response = await apiClient.get<ApiResponse<SystemConfig>>('/admin/config');
        return response.data.data ?? response.data; // fallback for raw data
    },

    async updateSystemConfig(config: UpdateSystemConfigDto): Promise<SystemConfig> {
        const response = await apiClient.patch<ApiResponse<SystemConfig>>('/admin/config', config);
        return response.data.data ?? response.data;
    },
};
