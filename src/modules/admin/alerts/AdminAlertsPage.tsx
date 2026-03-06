'use client';

import React, { useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useAlerts } from './hooks/useAlerts';
import { AlertsTable } from './components/AlertsTable';
import { AlertFilters } from './components/AlertFilters';
import { PaginationControls } from './components/PaginationControls';
import type { GetAlertsParams, AlertStatus, AlertType } from './alerts.types';

export function AdminAlertsPage() {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<Omit<GetAlertsParams, 'page' | 'limit'>>({
        status: undefined,
        type: undefined,
        pincode: '',
    });

    const activeTab: AlertStatus | 'ALL' = filters.status || 'ALL';

    const handleTabChange = (status: AlertStatus | 'ALL') => {
        setFilters((prev) => ({ ...prev, status: status === 'ALL' ? undefined : status, page: 1 }));
        setPage(1);
    };

    const handleFiltersChange = (newFilters: GetAlertsParams) => {
        setFilters({
            status: newFilters.status,
            type: newFilters.type,
            pincode: newFilters.pincode,
        });
        setPage(newFilters.page || 1);
    };

    const queryParams: GetAlertsParams = {
        page,
        limit: 20,
        ...filters,
    };

    // The backend might return Alert[] or AlertsResponse. If Alert[], we map it to length.
    const { data, isLoading, isError, refetch } = useAlerts(queryParams);

    const alerts = Array.isArray(data) ? data : data?.alerts ?? [];
    const total = Array.isArray(data) ? data.length : data?.total ?? alerts.length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Alerts Monitoring</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Read-only view for monitoring risk and fraud alerts across the system.
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    aria-label="Refresh alerts"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Tabs for Status Context */}
            <div className="flex items-center gap-6 border-b border-slate-200">
                {(['ALL', 'ACTIVE', 'RESOLVED'] as (AlertStatus | 'ALL')[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        {tab === 'ALL' ? 'All Alerts' : tab === 'ACTIVE' ? 'Active Alerts' : 'Resolved Alerts'}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <AlertFilters filters={{ ...filters, page }} onChange={handleFiltersChange} />
            </div>

            {/* Error State */}
            {isError && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Failed to load alerts. Check your connection or permissions and try again.
                    <button
                        onClick={() => refetch()}
                        className="ml-auto underline hover:no-underline font-medium"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <AlertsTable alerts={alerts} isLoading={isLoading} />
            </div>

            {/* Pagination */}
            {!isLoading && total > 0 && (
                <div className="py-2">
                    <PaginationControls
                        page={page}
                        limit={20}
                        total={total}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}
