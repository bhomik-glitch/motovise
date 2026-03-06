'use client';

import React from 'react';
import { AlertOctagon, ExternalLink, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { FraudScoreBadge } from './FraudScoreBadge';
import { RiskBadge } from './RiskBadge';
import type { Order } from '../orders.types';

interface OrdersTableProps {
    orders: Order[];
    isLoading: boolean;
    onRowClick: (order: Order) => void;
}

const STATUS_PILL: Record<string, string> = {
    PENDING: 'bg-slate-100 text-slate-600',
    CONFIRMED: 'bg-blue-50 text-blue-700',
    PROCESSING: 'bg-indigo-50 text-indigo-700',
    SHIPPED: 'bg-cyan-50 text-cyan-700',
    DELIVERED: 'bg-emerald-50 text-emerald-700',
    CANCELLED: 'bg-red-50 text-red-700',
    RETURNED: 'bg-orange-50 text-orange-700',
    REFUNDED: 'bg-purple-50 text-purple-700',
};

const PAYMENT_STATUS_PILL: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700',
    PAID: 'bg-emerald-50 text-emerald-700',
    FAILED: 'bg-red-50 text-red-700',
    REFUNDED: 'bg-purple-50 text-purple-700',
    PARTIALLY_REFUNDED: 'bg-orange-50 text-orange-700',
};

function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b border-slate-100">
            {Array.from({ length: 11 }).map((_, i) => (
                <td key={i} className="px-4 py-3.5">
                    <div className="h-4 bg-slate-100 rounded w-full" />
                </td>
            ))}
        </tr>
    );
}

function formatDate(iso: string) {
    try {
        return format(new Date(iso), 'dd MMM yy, HH:mm');
    } catch {
        return iso;
    }
}

function formatCurrency(amount: number) {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export function OrdersTable({ orders, isLoading, onRowClick }: OrdersTableProps) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                    <tr>
                        {[
                            'Order #',
                            'Customer',
                            'Amount',
                            'Payment Method',
                            'Payment Status',
                            'Order Status',
                            'Fraud Score',
                            'Risk',
                            'CB Flag',
                            'Created At',
                            '',
                        ].map((col) => (
                            <th
                                key={col}
                                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200"
                            >
                                {col === 'Created At' ? (
                                    <span className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-700">
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
                    {isLoading &&
                        Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

                    {!isLoading && orders.length === 0 && (
                        <tr>
                            <td colSpan={11} className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center gap-3 text-slate-400">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                        <AlertOctagon className="w-6 h-6" />
                                    </div>
                                    <p className="font-medium text-slate-500">No orders found</p>
                                    <p className="text-sm">Try adjusting your filters or search query.</p>
                                </div>
                            </td>
                        </tr>
                    )}

                    {!isLoading &&
                        orders.map((order) => (
                            <tr
                                key={order.id}
                                onClick={() => onRowClick(order)}
                                className="cursor-pointer hover:bg-blue-50/40 transition-colors group"
                            >
                                <td className="px-4 py-3.5">
                                    <span className="font-mono text-xs font-semibold text-blue-700 group-hover:text-blue-900">
                                        {order.orderNumber}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 max-w-[160px] truncate text-slate-700 font-medium">
                                    {order.customerName}
                                </td>
                                <td className="px-4 py-3.5 text-slate-800 font-semibold whitespace-nowrap">
                                    {formatCurrency(order.totalAmount)}
                                </td>
                                <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                                    {order.paymentMethod}
                                </td>
                                <td className="px-4 py-3.5">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${PAYMENT_STATUS_PILL[order.paymentStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_PILL[order.orderStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                                        {order.orderStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5">
                                    <FraudScoreBadge score={order.fraudScore} />
                                </td>
                                <td className="px-4 py-3.5">
                                    <RiskBadge level={order.riskLevel} />
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                    {order.chargebackFlag ? (
                                        <span
                                            title="Chargeback flagged"
                                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-50"
                                        >
                                            <AlertOctagon className="w-4 h-4 text-red-600" />
                                        </span>
                                    ) : (
                                        <span className="text-slate-300 text-xs">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                                    {formatDate(order.createdAt)}
                                </td>
                                <td className="px-4 py-3.5">
                                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
