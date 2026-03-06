'use client';

import React from 'react';
import {
    AlertTriangle,
    Banknote,
    CreditCard,
    Eye,
    ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Payment } from '../payments.types';

interface PaymentsTableProps {
    payments: Payment[];
    isLoading: boolean;
    onViewAttempts: (payment: Payment) => void;
}

// ── Visual indicator maps ──────────────────────────────────

const STATUS_PILL: Record<string, string> = {
    SUCCESS: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    FAILED: 'bg-red-50 text-red-700 border border-red-200',
    PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
};

// ── Helpers ────────────────────────────────────────────────

function formatDate(iso: string) {
    try {
        return format(new Date(iso), 'dd MMM yy, HH:mm');
    } catch {
        return iso;
    }
}

/** INR currency formatting — never display raw numbers on a financial dashboard */
function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(value);
}

// ── Sub-components ─────────────────────────────────────────

function MethodBadge({ method }: { method: Payment['method'] }) {
    if (method === 'COD') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <Banknote className="w-3 h-3" />
                COD
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <CreditCard className="w-3 h-3" />
            Razorpay
        </span>
    );
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b border-slate-100">
            {Array.from({ length: 10 }).map((_, i) => (
                <td key={i} className="px-4 py-3.5">
                    <div className="h-4 bg-slate-100 rounded w-full" />
                </td>
            ))}
        </tr>
    );
}

const COLUMNS = [
    'Payment ID',
    'Order ID',
    'User',
    'Method',
    'Status',
    'Amount',
    'Shipping',
    'Chargeback',
    'Created At',
    'Actions',
];

// ── Main component ─────────────────────────────────────────

export function PaymentsTable({ payments, isLoading, onViewAttempts }: PaymentsTableProps) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                    <tr>
                        {COLUMNS.map((col) => (
                            <th
                                key={col}
                                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200"
                            >
                                {col === 'Created At' ? (
                                    <span className="inline-flex items-center gap-1 cursor-default">
                                        {col}
                                        <ChevronDown className="w-3 h-3" />
                                    </span>
                                ) : (
                                    col
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                    {/* Loading skeletons */}
                    {isLoading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

                    {/* Empty state */}
                    {!isLoading && payments.length === 0 && (
                        <tr>
                            <td colSpan={10} className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center gap-3 text-slate-400">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <p className="font-medium text-slate-500">No payments found</p>
                                    <p className="text-sm">Try adjusting your filters or search query.</p>
                                </div>
                            </td>
                        </tr>
                    )}

                    {/* Data rows */}
                    {!isLoading &&
                        payments.map((payment) => (
                            <tr
                                key={payment.id}
                                className="hover:bg-blue-50/30 transition-colors group"
                            >
                                {/* Payment ID */}
                                <td className="px-4 py-3.5">
                                    <span className="font-mono text-xs text-slate-500">
                                        {payment.id.slice(0, 12)}…
                                    </span>
                                </td>

                                {/* Order ID */}
                                <td className="px-4 py-3.5">
                                    <span className="font-mono text-xs font-semibold text-blue-700">
                                        {payment.orderId.slice(0, 12)}…
                                    </span>
                                </td>

                                {/* User */}
                                <td className="px-4 py-3.5 max-w-[180px]">
                                    <div className="truncate">
                                        <span className="text-slate-700 text-xs">
                                            {payment.userEmail ?? payment.userId}
                                        </span>
                                    </div>
                                </td>

                                {/* Method badge */}
                                <td className="px-4 py-3.5 whitespace-nowrap">
                                    <MethodBadge method={payment.method} />
                                </td>

                                {/* Status badge */}
                                <td className="px-4 py-3.5">
                                    <span
                                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_PILL[payment.status] ?? 'bg-slate-100 text-slate-600'}`}
                                    >
                                        {payment.status}
                                    </span>
                                </td>

                                {/* Amount (formatted INR) */}
                                <td className="px-4 py-3.5 text-slate-800 font-semibold whitespace-nowrap">
                                    {formatCurrency(payment.amount)}
                                </td>

                                {/* Shipping cost */}
                                <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                                    {formatCurrency(payment.shippingCost)}
                                </td>

                                {/* Chargeback flag */}
                                <td className="px-4 py-3.5 text-center">
                                    {payment.chargeback ? (
                                        <span
                                            title="Chargeback flagged"
                                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50"
                                        >
                                            <AlertTriangle className="w-4 h-4 text-red-600" />
                                        </span>
                                    ) : (
                                        <span className="text-slate-300 text-xs">—</span>
                                    )}
                                </td>

                                {/* Created at */}
                                <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                                    {formatDate(payment.createdAt)}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3.5">
                                    <button
                                        onClick={() => onViewAttempts(payment)}
                                        title="View Payment Attempts"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Attempts
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
