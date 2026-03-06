'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRoles } from '@/modules/admin/rbac/hooks/useRoles';
import { RolesTable } from '@/modules/admin/rbac/roles/RolesTable';

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
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <RolesTable roles={roles} />
                )}
            </div>
        </ProtectedRoute>
    );
}
