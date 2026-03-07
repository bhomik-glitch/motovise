import { useQuery } from '@tanstack/react-query';
import { riskService } from '../risk.service';
import { RiskPincode } from '../risk.types';
import { queryKeys } from '@/lib/queryKeys';

export const useRiskData = () => {
    return useQuery<RiskPincode[]>({
        queryKey: queryKeys.risk,
        queryFn: riskService.getRiskPincodes,
    });
};
