'use client';

import React, { useState } from 'react';
import { Role } from '../rbac.types';
import { RolePermissionsModal } from './RolePermissionsModal';
import { FaEdit } from 'react-icons/fa';

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
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Role Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Permissions Count</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {roles.map((role) => (
                        <tr key={role.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{role.name}</div>
                                <div className="text-[10px] text-gray-500 font-medium">ID: {role.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {role._count?.permissions || 0} permissions
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => handleEditClick(role)}
                                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 transition-colors duration-150 font-semibold"
                                    title={`Edit ${role.name} permissions`}
                                >
                                    <FaEdit className="w-4 h-4" />
                                    <span>Edit Permissions</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {roles.length === 0 && (
                        <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                No roles found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && selectedRole && (
                <RolePermissionsModal
                    role={selectedRole}
                    onClose={handleClose}
                />
            )}
        </div>
    );
}
