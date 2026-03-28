import apiClient from '@/lib/api';
import type { Alert, AlertsResponse, GetAlertsParams } from '@/modules/admin/alerts/alerts.types';

interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

export const adminAlertsService = {
    /**
     * Fetch paginated, filtered list of alerts.
     * GET /v1/admin/alerts
     */
    getAlerts: async (params: GetAlertsParams): Promise<AlertsResponse | Alert[]> => {
        const cleanParams: Record<string, string | number> = {};
        if (params.page !== undefined) cleanParams.page = params.page;
        if (params.limit !== undefined) cleanParams.limit = params.limit;
        if (params.status) cleanParams.status = params.status;
        if (params.type) cleanParams.type = params.type;
        if (params.pincode?.trim()) cleanParams.pincode = params.pincode.trim();

        const response = await apiClient.get<ApiResponse<AlertsResponse | Alert[]>>(
            '/admin/alerts',
            { params: cleanParams }
        );
        return response.data.data;
    },
};
