import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSettingsService } from '@/services/adminSettingsService';
import { UpdateSystemConfigDto } from '../settings.types';
import toast from 'react-hot-toast';

export const useSystemConfig = () => {
    return useQuery({
        queryKey: ['system-config'],
        queryFn: () => adminSettingsService.getSystemConfig(),
        staleTime: 5 * 60 * 1000,
    });
};

export const useUpdateSystemConfig = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateSystemConfigDto) => adminSettingsService.updateSystemConfig(data),
        onSuccess: () => {
            // Invalidate relevant queries to ensure UI consistency across admin panel
            queryClient.invalidateQueries({ queryKey: ['system-config'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['risk'] });
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
            toast.success('System configuration updated successfully');
        },
        onError: (error: unknown) => {
            const message = (error as any)?.response?.data?.message || 'Failed to update system configuration';
            toast.error(
                Array.isArray(message) ? message[0] : message
            );
        },
    });
};
