import { useQuery } from '@tanstack/react-query';
import { adminAlertsService } from '@/services/adminAlertsService';
import type { GetAlertsParams } from '../alerts.types';

export const useAlerts = (filters: GetAlertsParams) => {
    return useQuery({
        queryKey: ['admin_alerts', filters],
        queryFn: () => adminAlertsService.getAlerts(filters),
        refetchInterval: 60000, // auto refetch every 60 seconds
    });
};
