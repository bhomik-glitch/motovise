import api from '@/lib/api';
import { Role, Permission, AdminUser } from './rbac.types';

export const adminRBACService = {
    fetchRoles: async (): Promise<Role[]> => {
        const { data } = await api.get('/admin/rbac/roles');
        return data.data;
    },

    fetchRolePermissions: async (roleId: string): Promise<Permission[]> => {
        const { data } = await api.get(`/admin/rbac/roles/${roleId}/permissions`);
        return data.data;
    },

    updateRolePermissions: async (roleId: string, permissions: string[]): Promise<any> => {
        const { data } = await api.patch(`/admin/rbac/roles/${roleId}/permissions`, { permissions });
        return data.data;
    },

    fetchUsers: async (): Promise<AdminUser[]> => {
        const { data } = await api.get('/admin/rbac/users');
        return data.data;
    },

    assignUserRole: async (userId: string, roleId: string): Promise<AdminUser> => {
        const { data } = await api.patch(`/admin/rbac/users/${userId}/role`, { roleId });
        return data.data;
    }
};
