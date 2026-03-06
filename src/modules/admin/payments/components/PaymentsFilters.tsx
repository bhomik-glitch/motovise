'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import type {
    PaymentsQueryParams,
    PaymentGatewayStatus,
    PaymentGatewayMethod,
} from '../payments.types';

type FiltersState = Omit<PaymentsQueryParams, 'page' | 'limit'>;

interface PaymentsFiltersProps {
    filters: FiltersState;
    onChange: (filters: FiltersState) => void;
}

const STATUS_OPTIONS: { label: string; value: PaymentGatewayStatus | '' }[] = [
    { label: 'All Statuses', value: '' },
    { label: 'Success', value: 'SUCCESS' },
    { label: 'Failed', value: 'FAILED' },
    { label: 'Pending', value: 'PENDING' },
];

const METHOD_OPTIONS: { label: string; value: PaymentGatewayMethod | '' }[] = [
    { label: 'All Methods', value: '' },
    { label: 'COD', value: 'COD' },
    { label: 'Razorpay', value: 'RAZORPAY' },
];

export function PaymentsFilters({ filters, onChange }: PaymentsFiltersProps) {
    const hasActiveFilters =
        !!filters.status ||
        !!filters.method ||
        !!filters.dateFrom ||
        !!filters.dateTo ||
        !!filters.search;

    const handleReset = () => {
        onChange({ status: '', method: '', dateFrom: '', dateTo: '', search: '' });
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search Order ID or Razorpay ID…"
                    value={filters.search ?? ''}
                    onChange={(e) => onChange({ ...filters, search: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Status filter */}
            <select
                value={filters.status ?? ''}
                onChange={(e) =>
                    onChange({ ...filters, status: e.target.value as PaymentGatewayStatus | '' })
                }
                className="py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Method filter */}
            <select
                value={filters.method ?? ''}
                onChange={(e) =>
                    onChange({ ...filters, method: e.target.value as PaymentGatewayMethod | '' })
                }
                className="py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {METHOD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Date From */}
            <div className="flex items-center gap-1.5">
                <label className="text-xs text-slate-500 whitespace-nowrap">From</label>
                <input
                    type="date"
                    value={filters.dateFrom ?? ''}
                    onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                    className="py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Date To */}
            <div className="flex items-center gap-1.5">
                <label className="text-xs text-slate-500 whitespace-nowrap">To</label>
                <input
                    type="date"
                    value={filters.dateTo ?? ''}
                    onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                    className="py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Clear button */}
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
