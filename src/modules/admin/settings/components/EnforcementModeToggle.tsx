import React, { useState } from 'react';
import { useUpdateSystemConfig } from '../hooks/useSystemConfig';
import { SystemConfig } from '../settings.types';

interface ToggleProps {
    initialMode: SystemConfig['enforcementMode'];
}

export const EnforcementModeToggle: React.FC<ToggleProps> = ({ initialMode }) => {
    const { mutate: updateConfig, isPending } = useUpdateSystemConfig();
    const [showModal, setShowModal] = useState(false);
    const [pendingMode, setPendingMode] = useState<SystemConfig['enforcementMode'] | null>(null);

    const handleToggle = () => {
        const newMode = initialMode === 'DISABLE' ? 'FLAG' : 'DISABLE';
        setPendingMode(newMode);
        setShowModal(true);
    };

    const confirmToggle = () => {
        if (pendingMode) {
            updateConfig({ enforcementMode: pendingMode });
        }
        setShowModal(false);
    };

    return (
        <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Enforcement Mode</h3>
                    <p className="text-sm text-gray-500">
                        Current mode: <span className="font-semibold">{initialMode}</span>
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={isPending}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    Switch to {initialMode === 'DISABLE' ? 'FLAG' : 'DISABLE'} Mode
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4 shadow-xl">
                        <h4 className="text-lg font-medium mb-4 text-gray-900">Confirm Mode Change</h4>
                        <p className="text-sm text-gray-500 mb-6">
                            Changing enforcement mode will affect checkout behavior for high-risk pincodes.
                            Are you sure you want to continue?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                disabled={isPending}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmToggle}
                                disabled={isPending}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {isPending ? 'Confirming...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
