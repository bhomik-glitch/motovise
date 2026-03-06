'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FraudConfig } from '../risk.types';
import { useFraudConfigMutation } from '../hooks/useFraudConfig';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

interface EnforcementToggleProps {
    config?: FraudConfig;
}

export function EnforcementToggle({ config }: EnforcementToggleProps) {
    const { hasPermission } = useAuth();
    const canUpdate = hasPermission('fraud.config.update');
    const updateConfig = useFraudConfigMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingMode, setPendingMode] = useState<'DISABLE' | 'FLAG' | null>(null);

    const handleToggleClick = (mode: 'DISABLE' | 'FLAG') => {
        if (!canUpdate || config?.codEnforcement === mode) return;
        setPendingMode(mode);
        setIsModalOpen(true);
    };

    const handleConfirm = () => {
        if (pendingMode) {
            updateConfig.mutate(
                { codEnforcement: pendingMode },
                {
                    onSettled: () => {
                        setIsModalOpen(false);
                        setPendingMode(null);
                    },
                }
            );
        }
    };

    const activeMode = config?.codEnforcement;

    return (
        <>
            <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Shield size={20} className="text-gray-500" />
                        COD Enforcement Mode
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Control checkout behavior for high-risk pincodes.
                    </p>
                </div>

                <div className="relative group">
                    <div
                        className={cn(
                            "flex p-1 bg-gray-100 rounded-lg transition-all",
                            !canUpdate && "opacity-60 cursor-not-allowed"
                        )}
                    >
                        <button
                            onClick={() => handleToggleClick('DISABLE')}
                            disabled={!canUpdate || updateConfig.isPending}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                                activeMode === 'DISABLE'
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            DISABLE
                        </button>
                        <button
                            onClick={() => handleToggleClick('FLAG')}
                            disabled={!canUpdate || updateConfig.isPending}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                                activeMode === 'FLAG'
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            FLAG
                        </button>
                    </div>

                    {!canUpdate && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none">
                            Insufficient permission
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Action</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            You are about to change COD fraud enforcement.
                            <br />
                            This will affect checkout behavior for high-risk pincodes.
                            <br /><br />
                            Are you sure you want to proceed?
                        </p>
                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={updateConfig.isPending}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={updateConfig.isPending}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-900 focus:outline-none disabled:opacity-50"
                            >
                                {updateConfig.isPending ? 'Confirming...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
