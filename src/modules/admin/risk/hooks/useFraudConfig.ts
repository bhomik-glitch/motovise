import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riskService } from '../risk.service';
import { FraudConfig, UpdateFraudConfigDto } from '../risk.types';
import toast from 'react-hot-toast';
import { queryKeys } from '@/lib/queryKeys';

export const useFraudConfigQuery = () => {
    return useQuery<FraudConfig>({
        queryKey: queryKeys.fraudConfig,
        queryFn: riskService.getFraudConfig,
    });
};

export const useFraudConfigMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateFraudConfigDto) =>
            riskService.updateFraudConfig(payload),
        onSuccess: () => {
            toast.success('Fraud configuration updated');
            queryClient.invalidateQueries({ queryKey: queryKeys.fraudConfig });
        },
        onError: (error) => {
            toast.error('Failed to update fraud configuration');
            console.error(error);
        },
    });
};
