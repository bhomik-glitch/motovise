import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRBACService } from '../adminRBACService';

export const useAssignUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
            adminRBACService.assignUserRole(userId, roleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
};
