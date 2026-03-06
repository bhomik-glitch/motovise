import { useQuery } from '@tanstack/react-query';
import { adminRBACService } from '../adminRBACService';

export const useRoles = () => {
    return useQuery({
        queryKey: ['admin', 'roles'],
        queryFn: () => adminRBACService.fetchRoles(),
    });
};
