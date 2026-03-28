'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ConfigForm } from '@/modules/admin/settings/components/ConfigForm';
import { useSystemConfig } from '@/modules/admin/settings/hooks/useSystemConfig';

export default function SettingsPage() {
    const { data: config, isLoading, isError } = useSystemConfig();

    return (
        <ProtectedRoute permission="SYSTEM_CONFIG_EDIT">
            <div className="p-6 max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage global operational thresholds and security limits.</p>
                </div>

                {isError && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">Error loading configuration. Please try again.</p>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="bg-white shadow rounded-lg p-6 animate-pulse space-y-4">
                        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                ) : config ? (
                    <div className="bg-white shadow rounded-lg p-6">
                        <ConfigForm initialData={config} />
                    </div>
                ) : null}
            </div>
        </ProtectedRoute>
    );
}
