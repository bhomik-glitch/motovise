'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRoles } from '@/modules/admin/rbac/hooks/useRoles';
import { RolesTable } from '@/modules/admin/rbac/roles/RolesTable';
import { Skeleton } from '@/components/ui/Skeleton';

export default function RolesManagementPage() {
    const { data: roles = [], isLoading, error } = useRoles();

    return (
        <ProtectedRoute permission="rbac.manage">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage system roles and their assigned access permissions.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    Error loading roles. Please try again.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <RolesTable roles={roles} />
                )}
            </div>
        </ProtectedRoute>
    );
}
