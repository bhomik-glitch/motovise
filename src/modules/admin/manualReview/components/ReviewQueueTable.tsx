import React, { useState } from 'react';
import { format } from 'date-fns';
import { AlertOctagon, Phone, CheckCircle, X, ShieldAlert } from 'lucide-react';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { getFraudScoreColor } from '@/utils/getFraudScoreColor';
import type { ManualReviewQueueItem } from '../manualReview.types';
import { useApproveReview } from '../hooks/useApproveReview';
import { useRejectReview } from '../hooks/useRejectReview';
import { useMarkCalled } from '../hooks/useMarkCalled';

interface ReviewQueueTableProps {
    orders: ManualReviewQueueItem[];
    isLoading: boolean;
    onRowClick: (order: ManualReviewQueueItem) => void;
}

function formatDate(iso: string) {
    try {
        return format(new Date(iso), 'dd MMM yy, HH:mm');
    } catch {
        return iso;
    }
}

export function ReviewQueueTable({ orders, isLoading, onRowClick }: ReviewQueueTableProps) {
    const approveMutation = useApproveReview();
    const rejectMutation = useRejectReview();
    const markCalledMutation = useMarkCalled();

    const [rejectConfirmId, setRejectConfirmId] = useState<string | null>(null);

    const isMutatingAny = approveMutation.isPending || rejectMutation.isPending || markCalledMutation.isPending;

    const handleApprove = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        approveMutation.mutate(id);
    };

    const handleRejectClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setRejectConfirmId(id);
    };

    const handleConfirmReject = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        rejectMutation.mutate(id, {
            onSuccess: () => setRejectConfirmId(null)
        });
    };

    const handleCancelReject = (e: React.MouseEvent) => {
        e.stopPropagation();
        setRejectConfirmId(null);
    };

    const handleMarkCalled = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        markCalledMutation.mutate(id);
    };

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200">Fraud Score</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200">Risk Level</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200">Rule Triggers</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200">Created At</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {isLoading &&
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="animate-pulse border-b border-slate-100">
                                {Array.from({ length: 8 }).map((_, j) => (
                                    <td key={j} className="px-4 py-3.5">
                                        <div className="h-4 bg-slate-100 rounded w-full" />
                                    </td>
                                ))}
                            </tr>
                        ))}

                    {!isLoading && orders.length === 0 && (
                        <tr>
                            <td colSpan={8} className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center gap-3 text-slate-400">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                        <ShieldAlert className="w-6 h-6" />
                                    </div>
                                    <p className="font-medium text-slate-500">No orders currently require manual review.</p>
                                    <p className="text-sm">New flagged orders will appear here automatically.</p>
                                </div>
                            </td>
                        </tr>
                    )}

                    {!isLoading && orders.map((order) => {
                        const isTerminalState = order.status === 'APPROVED' || order.status === 'REJECTED';
                        const scoreColor = getFraudScoreColor(order.fraudScore);
                        const scoreTextClass = scoreColor === 'green' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : scoreColor === 'yellow' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200';

                        return (
                            <tr
                                key={order.id}
                                onClick={() => onRowClick(order)}
                                className="cursor-pointer hover:bg-slate-50/60 transition-colors group"
                            >
                                <td className="px-4 py-3.5">
                                    <span className="font-mono text-xs font-semibold text-blue-700 group-hover:text-blue-900">
                                        {order.orderNumber}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 max-w-[160px] truncate text-slate-700 font-medium">
                                    <div>{order.customerName}</div>
                                    <div className="text-xs text-slate-500 font-normal truncate">{order.customerEmail}</div>
                                </td>
                                <td className="px-4 py-3.5">
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-xs font-bold ${scoreTextClass}`}>
                                        {order.fraudScore}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5">
                                    <span className={`text-xs font-bold uppercase ${scoreColor === 'green' ? 'text-emerald-600' : scoreColor === 'yellow' ? 'text-amber-500' : 'text-red-600'}`}>
                                        {order.riskLevel}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 text-center font-medium text-slate-600">
                                    {order.ruleTriggerCount}
                                </td>
                                <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                                    {formatDate(order.createdAt)}
                                </td>
                                <td className="px-4 py-3.5">
                                    <ReviewStatusBadge status={order.status} />
                                </td>
                                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                    {rejectConfirmId === order.id ? (
                                        <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-right-2">
                                            <span className="text-xs font-bold text-red-600 mr-2">Reject?</span>
                                            <button
                                                onClick={handleCancelReject}
                                                disabled={isMutatingAny}
                                                className="px-2 py-1 text-xs border border-slate-200 bg-white rounded text-slate-600 hover:bg-slate-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={(e) => handleConfirmReject(e, order.id)}
                                                disabled={isMutatingAny}
                                                className="px-2 py-1 text-xs border border-transparent bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {order.status === 'PENDING' && (
                                                <button
                                                    title="Mark Called"
                                                    disabled={isMutatingAny}
                                                    onClick={(e) => handleMarkCalled(e, order.id)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                </button>
                                            )}
                                            {!isTerminalState && (
                                                <>
                                                    <button
                                                        title="Reject"
                                                        disabled={isMutatingAny}
                                                        onClick={(e) => handleRejectClick(e, order.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        title="Approve"
                                                        disabled={isMutatingAny}
                                                        onClick={(e) => handleApprove(e, order.id)}
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            {isTerminalState && (
                                                <span className="text-xs text-slate-400 font-medium px-2 py-1">done</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
