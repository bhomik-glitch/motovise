import apiClient from '@/lib/api';
import { DashboardData, ActiveAlert } from '@/modules/admin/dashboard/dashboard.types';
import { ApiResponse } from '@/types/api.types';

export const adminDashboardService = {
    getDashboardMetrics: async (): Promise<Omit<DashboardData, 'activeAlerts'>> => {
        const response = await apiClient.get<ApiResponse<any>>('/admin/dashboard/ceo');
        const raw = response.data.data;

        return {
            mtdGMV: raw.gmv_mtd || 0,
            ordersCount: raw.orders_mtd || 0,
            prepaidPercentage: raw.prepaid_percentage_mtd || 0,
            rtoRate: raw.rto_percentage_7d || 0,
            chargebackRate: raw.chargeback_percentage_30d || 0,
            avgShippingCost: raw.avg_shipping_cost_30d || 0,
            manualReviewPending: raw.manual_review_pending_count || 0,
            highRiskPincodes: (raw.top_high_risk_pincodes || []).map((p: any) => ({
                pincode: p.pincode,
                rtoRate: p.rtoPercentage,
                totalOrders: p.totalOrders,
                riskLevel: 'HIGH'
            }))
        };
    },
    getDashboardAlerts: async (): Promise<ActiveAlert[]> => {
        const response = await apiClient.get<ApiResponse<any[]>>('/admin/alerts');
        const rawAlerts = response.data.data || [];

        return rawAlerts
            .filter(a => a.status === 'ACTIVE')
            .map(a => ({
                id: a.id,
                type: a.type,
                pincode: a.pincode || 'Global',
                message: a.pincode
                    ? `High RTO detected in pincode ${a.pincode} (${a.metricValue}%)`
                    : `System-wide ${a.type.replace(/_/g, ' ')} threshold breached (${a.metricValue}%)`,
                createdAt: a.firstTriggeredAt || a.createdAt
            }));
    }
};
