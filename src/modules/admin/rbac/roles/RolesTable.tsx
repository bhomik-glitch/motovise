'use client';

import React, { useState } from 'react';
import { Role } from '../rbac.types';
import { RolePermissionsModal } from './RolePermissionsModal';
import { FaEdit } from 'react-icons/fa';

import { cn } from '@/lib/utils';

interface RolesTableProps {
    roles: Role[];
}

export function RolesTable({ roles }: RolesTableProps) {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleEditClick = (role: Role) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedRole(null);
    };

    return (
        <div className="space-y-4">
            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Role Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Permissions</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {roles.map((role) => (
                            <tr key={role.id} className="hover:bg-slate-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">{role.name}</div>
                                    <div className="text-[10px] text-gray-400 font-medium">ID: {role.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                        {role._count?.permissions || 0} permissions
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEditClick(role)}
                                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1.5 transition-colors duration-150 font-bold"
                                        title={`Edit ${role.name} permissions`}
                                    >
                                        <FaEdit className="w-4 h-4" />
                                        <span>Edit Permissions</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards - Hidden on Desktop */}
            <div className="md:hidden space-y-3">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="border rounded-lg p-4 flex flex-col gap-3 bg-white shadow-sm"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900 uppercase tracking-tight">{role.name}</span>
                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                {role._count?.permissions || 0} permissions
                            </span>
                        </div>

                        <div className="text-xs text-muted-foreground font-mono bg-gray-50 px-2 py-0.5 rounded w-fit">
                            Role ID: {role.id}
                        </div>

                        <div className="flex justify-end pt-1">
                            <button
                                onClick={() => handleEditClick(role)}
                                className="h-10 px-4 rounded-md border border-indigo-100 text-sm font-bold text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                <FaEdit className="w-4 h-4" />
                                Edit Role
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {roles.length === 0 && (
                <div className="bg-white shadow rounded-lg p-10 text-center text-gray-500 border-2 border-dashed border-gray-100">
                    No roles found.
                </div>
            )}

            {isModalOpen && selectedRole && (
                <RolePermissionsModal
                    role={selectedRole}
                    onClose={handleClose}
                />
            )}
        </div>
    );
}
