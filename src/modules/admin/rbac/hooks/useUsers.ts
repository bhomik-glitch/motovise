import { useQuery } from '@tanstack/react-query';
import { adminRBACService } from '../adminRBACService';
import { queryKeys } from '@/lib/queryKeys';

export const useUsers = () => {
    return useQuery({
        queryKey: queryKeys.users,
        queryFn: () => adminRBACService.fetchUsers(),
    });
};
