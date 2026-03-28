'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import type { AlertStatus, AlertType, GetAlertsParams } from '../alerts.types';

interface AlertFiltersProps {
    filters: GetAlertsParams;
    onChange: (filters: GetAlertsParams) => void;
}

const STATUS_OPTIONS: { label: string; value: AlertStatus | '' }[] = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Resolved', value: 'RESOLVED' },
];

const TYPE_OPTIONS: { label: string; value: AlertType | '' }[] = [
    { label: 'All Types', value: '' },
    { label: 'Overall RTO', value: 'OVERALL_RTO' },
    { label: 'Pincode RTO', value: 'PINCODE_RTO' },
    { label: 'Chargeback Rate', value: 'CHARGEBACK_RATE' },
    { label: 'Manual Review Queue', value: 'MANUAL_REVIEW_QUEUE' },
];

export function AlertFilters({ filters, onChange }: AlertFiltersProps) {
    const hasActiveFilters = !!filters.status || !!filters.type || !!filters.pincode;

    const handleReset = () => {
        onChange({ status: undefined, type: undefined, pincode: '', page: 1 });
    };

    return (
        <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Pincode Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search pincode…"
                    value={filters.pincode ?? ''}
                    onChange={(e) => onChange({ ...filters, pincode: e.target.value, page: 1 })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Status filter */}
            <select
                value={filters.status ?? ''}
                onChange={(e) =>
                    onChange({ ...filters, status: (e.target.value as AlertStatus) || undefined, page: 1 })
                }
                className="py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Type filter */}
            <select
                value={filters.type ?? ''}
                onChange={(e) =>
                    onChange({ ...filters, type: (e.target.value as AlertType) || undefined, page: 1 })
                }
                className="py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Clear filters */}
            {hasActiveFilters && (
                <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 py-2 px-3 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                    Clear
                </button>
            )}
        </div>
    );
}
