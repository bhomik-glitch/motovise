import { useQuery } from '@tanstack/react-query';
import { adminRBACService } from '../adminRBACService';
import { queryKeys } from '@/lib/queryKeys';

export const useRoles = () => {
    return useQuery({
        queryKey: queryKeys.roles,
        queryFn: () => adminRBACService.fetchRoles(),
    });
};
