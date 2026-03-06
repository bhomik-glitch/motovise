'use client';

import React, { useState } from 'react';
import { AdminUser, Role } from '../rbac.types';
import { RoleAssignmentModal } from './RoleAssignmentModal';
import { FaUserShield } from 'react-icons/fa';

interface UsersTableProps {
    users: AdminUser[];
    roles: Role[];
}

export function UsersTable({ users, roles }: UsersTableProps) {
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChangeRoleClick = (user: AdminUser) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Current Role</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.name || 'No Name'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <div className="text-[10px] text-gray-500 font-medium">ID: {user.id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.roleRef?.name === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                    {user.roleRef?.name || 'No Role Assigned'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => handleChangeRoleClick(user)}
                                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 transition-colors duration-150 font-semibold"
                                    title={`Change role for ${user.email}`}
                                >
                                    <FaUserShield className="w-4 h-4" />
                                    <span>Change Role</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                No users found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {isModalOpen && selectedUser && (
                <RoleAssignmentModal
                    user={selectedUser}
                    roles={roles}
                    onClose={handleClose}
                />
            )}
        </div>
    );
}
