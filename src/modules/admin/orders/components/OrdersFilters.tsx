'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import type { OrdersQueryParams, OrderStatus, PaymentMethod, RiskLevel } from '../orders.types';

interface OrdersFiltersProps {
    filters: Omit<OrdersQueryParams, 'page' | 'limit'>;
    onChange: (filters: Omit<OrdersQueryParams, 'page' | 'limit'>) => void;
}

const ORDER_STATUS_OPTIONS: { label: string; value: OrderStatus | '' }[] = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Returned', value: 'RETURNED' },
    { label: 'Refunded', value: 'REFUNDED' },
];

const RISK_LEVEL_OPTIONS: { label: string; value: RiskLevel | '' }[] = [
    { label: 'All Risk Levels', value: '' },
    { label: '🟢 Low', value: 'LOW' },
    { label: '🟡 Medium', value: 'MEDIUM' },
    { label: '🔴 High', value: 'HIGH' },
];

const PAYMENT_METHOD_OPTIONS: { label: string; value: PaymentMethod | '' }[] = [
    { label: 'All Methods', value: '' },
    { label: 'Prepaid', value: 'PREPAID' },
    { label: 'COD', value: 'COD' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Card', value: 'CARD' },
    { label: 'Netbanking', value: 'NETBANKING' },
    { label: 'Wallet', value: 'WALLET' },
];

export function OrdersFilters({ filters, onChange }: OrdersFiltersProps) {
    const hasActiveFilters =
        !!filters.status || !!filters.riskLevel || !!filters.paymentMethod || !!filters.search;

    const handleReset = () => {
        onChange({ status: '', riskLevel: '', paymentMethod: '', search: '' });
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search order # or customer…"
                    value={filters.search ?? ''}
                    onChange={(e) => onChange({ ...filters, search: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Status filter */}
            <select
                value={filters.status ?? ''}
                onChange={(e) =>
                    onChange({ ...filters, status: e.target.value as OrderStatus | '' })
                }
                className="py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {ORDER_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Risk level filter */}
            <select
                value={filters.riskLevel ?? ''}
                onChange={(e) =>
                    onChange({ ...filters, riskLevel: e.target.value as RiskLevel | '' })
                }
                className="py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {RISK_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Payment method filter */}
            <select
                value={filters.paymentMethod ?? ''}
                onChange={(e) =>
                    onChange({ ...filters, paymentMethod: e.target.value as PaymentMethod | '' })
                }
                className="py-2 px-3 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {PAYMENT_METHOD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
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
