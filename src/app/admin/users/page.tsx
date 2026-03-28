'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useUsers } from '@/modules/admin/rbac/hooks/useUsers';
import { useRoles } from '@/modules/admin/rbac/hooks/useRoles';
import { UsersTable } from '@/modules/admin/rbac/users/UsersTable';
import { Skeleton } from '@/components/ui/Skeleton';

export default function UsersManagementPage() {
    const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useUsers();
    const { data: roles = [], isLoading: isLoadingRoles, error: rolesError } = useRoles();

    const isLoading = isLoadingUsers || isLoadingRoles;
    const error = usersError || rolesError;

    return (
        <ProtectedRoute permission="rbac.manage">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage system administrators and their assigned roles.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    Error loading data. Please try again.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <UsersTable users={users} roles={roles} />
                )}
            </div>
        </ProtectedRoute>
    );
}
