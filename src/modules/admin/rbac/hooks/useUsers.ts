import { useQuery } from '@tanstack/react-query';
import { adminRBACService } from '../adminRBACService';

export const useUsers = () => {
    return useQuery({
        queryKey: ['admin', 'users'],
        queryFn: () => adminRBACService.fetchUsers(),
    });
};
