import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riskService } from '../risk.service';
import { FraudConfig, UpdateFraudConfigDto } from '../risk.types';
import toast from 'react-hot-toast';

export const useFraudConfigQuery = () => {
    return useQuery<FraudConfig>({
        queryKey: ['fraud-config'],
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
            queryClient.invalidateQueries({ queryKey: ['fraud-config'] });
        },
        onError: (error) => {
            toast.error('Failed to update fraud configuration');
            console.error(error);
        },
    });
};
