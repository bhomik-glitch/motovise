import { useQuery } from '@tanstack/react-query';
import { riskService } from '../risk.service';
import { RiskPincode } from '../risk.types';

export const useRiskData = () => {
    return useQuery<RiskPincode[]>({
        queryKey: ['admin-risk'],
        queryFn: riskService.getRiskPincodes,
    });
};
