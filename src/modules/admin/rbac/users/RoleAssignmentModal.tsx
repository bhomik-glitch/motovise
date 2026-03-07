'use client';

import React, { useState } from 'react';
import { AdminUser, Role } from '../rbac.types';
import { useAssignUserRole } from '../hooks/useAssignUserRole';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface RoleAssignmentModalProps {
    user: AdminUser;
    roles: Role[];
    onClose: () => void;
}

export function RoleAssignmentModal({ user, roles, onClose }: RoleAssignmentModalProps) {
    // Find current role ID or default to empty string if none assigned
    const [selectedRoleId, setSelectedRoleId] = useState<string>(user.roleRef?.id || '');
    const [showConfirm, setShowConfirm] = useState(false);
    const { user: currentUser } = useAuth(); // Assuming AuthProvider exposes current user

    const { mutate, isPending } = useAssignUserRole();

    // Self-demotion protection on frontend
    const isSelf = currentUser?.id === user.id;

    const attemptSave = () => {
        if (isSelf) {
            toast.error('You cannot modify your own super-admin privileges or role assignments.');
            return;
        }

        if (!selectedRoleId) {
            toast.error('Please select a role.');
            return;
        }

        // Identical role check
        if (selectedRoleId === user.roleRef?.id) {
            onClose(); // No change needed
            return;
        }

        setShowConfirm(true);
    };

    const confirmSave = () => {
        mutate(
            { userId: user.id, roleId: selectedRoleId },
            {
                onSuccess: () => {
                    toast.success(`Successfully assigned new role to ${user.email}`);
                    setShowConfirm(false);
                    onClose();
                },
                onError: (error: unknown) => {
                    toast.error((error as any)?.response?.data?.message || 'Failed to assign role');
                    setShowConfirm(false);
                }
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {!showConfirm ? (
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Assign Role to User
                                    </h3>

                                    <div className="mt-4">
                                        <div className="bg-gray-50 p-3 rounded-md mb-4 border border-gray-200">
                                            <p className="text-sm font-medium text-gray-900">{user.name || 'No Name'}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>

                                        {isSelf && (
                                            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                                                <div className="flex">
                                                    <div className="ml-3">
                                                        <p className="text-sm text-red-700">
                                                            You cannot modify your own role assignment. This prevents accidental self-demotion or lockouts.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Role
                                        </label>
                                        <select
                                            id="role-select"
                                            name="role"
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                                            value={selectedRoleId}
                                            onChange={(e) => setSelectedRoleId(e.target.value)}
                                            disabled={isSelf || isPending}
                                        >
                                            <option value="" disabled>Select a role...</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Confirm Role Assignment
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Changing a user&apos;s role will immediately grant or revoke permissions based on the new role&apos;s configuration. Are you sure?
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                        {!showConfirm ? (
                            <>
                                <button
                                    type="button"
                                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${isSelf || isPending ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm`}
                                    onClick={attemptSave}
                                    disabled={isSelf || isPending}
                                >
                                    Save Assignment
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={onClose}
                                    disabled={isPending}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={confirmSave}
                                    disabled={isPending}
                                >
                                    {isPending ? 'Assigning...' : 'Confirm Assignment'}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setShowConfirm(false)}
                                    disabled={isPending}
                                >
                                    Back
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
