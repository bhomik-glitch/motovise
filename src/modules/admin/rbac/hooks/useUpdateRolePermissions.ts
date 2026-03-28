import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRBACService } from '../adminRBACService';

export const useUpdateRolePermissions = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roleId, permissions }: { roleId: string; permissions: string[] }) =>
            adminRBACService.updateRolePermissions(roleId, permissions),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
        },
    });
};
