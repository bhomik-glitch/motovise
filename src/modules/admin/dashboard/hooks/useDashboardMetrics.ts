import { useQuery } from '@tanstack/react-query';
import { adminDashboardService } from '@/services/adminDashboardService';
import { useAuth } from '@/hooks/useAuth';
import { DashboardMetrics } from '../dashboard.types';

export const useDashboardMetrics = () => {
    const { hasPermission } = useAuth();
    const canViewAlerts = hasPermission('alerts.view');

    const metricsQuery = useQuery({
        queryKey: ['admin_dashboard_metrics'],
        queryFn: adminDashboardService.getDashboardMetrics,
        refetchInterval: 60000,
    });

    const alertsQuery = useQuery({
        queryKey: ['admin_dashboard_alerts'],
        queryFn: adminDashboardService.getDashboardAlerts,
        enabled: canViewAlerts,
        refetchInterval: 60000,
    });

    return {
        metrics: metricsQuery.data ? {
            mtdGMV: metricsQuery.data.mtdGMV,
            ordersCount: metricsQuery.data.ordersCount,
            prepaidPercentage: metricsQuery.data.prepaidPercentage,
            rtoRate: metricsQuery.data.rtoRate,
            chargebackRate: metricsQuery.data.chargebackRate,
            avgShippingCost: metricsQuery.data.avgShippingCost,
            manualReviewPending: metricsQuery.data.manualReviewPending,
        } : null,
        highRiskPincodes: metricsQuery.data?.highRiskPincodes || [],
        activeAlerts: alertsQuery.data || [],
        isLoading: metricsQuery.isLoading || (canViewAlerts && alertsQuery.isLoading),
        error: metricsQuery.error || alertsQuery.error,
        refetch: () => {
            metricsQuery.refetch();
            if (canViewAlerts) alertsQuery.refetch();
        }
    };
};
