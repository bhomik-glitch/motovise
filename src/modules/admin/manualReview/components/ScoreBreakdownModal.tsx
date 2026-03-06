import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Phone, ShieldAlert } from 'lucide-react';
import { getFraudScoreColor } from '@/utils/getFraudScoreColor';
import { ReviewStatusBadge } from './ReviewStatusBadge';
import { useApproveReview } from '../hooks/useApproveReview';
import { useRejectReview } from '../hooks/useRejectReview';
import { useMarkCalled } from '../hooks/useMarkCalled';
import type { ManualReviewQueueItem } from '../manualReview.types';

interface ScoreBreakdownModalProps {
    order: ManualReviewQueueItem;
    isOpen: boolean;
    onClose: () => void;
}

export function ScoreBreakdownModal({ order, isOpen, onClose }: ScoreBreakdownModalProps) {
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);

    const approveMutation = useApproveReview();
    const rejectMutation = useRejectReview();
    const markCalledMutation = useMarkCalled();

    if (!isOpen) return null;

    const isMutating = approveMutation.isPending || rejectMutation.isPending || markCalledMutation.isPending;
    const isTerminalState = order.status === 'APPROVED' || order.status === 'REJECTED';

    // Only PENDING and CALLED can be Approved/Rejected
    const canApprove = !isTerminalState;
    const canReject = !isTerminalState;
    // Only PENDING can be marked as called
    const canMarkCalled = order.status === 'PENDING';

    const handleApprove = () => {
        approveMutation.mutate(order.id, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const handleRejectClick = () => {
        setShowRejectConfirm(true);
    };

    const handleConfirmReject = () => {
        rejectMutation.mutate(order.id, {
            onSuccess: () => {
                setShowRejectConfirm(false);
                onClose();
            }
        });
    };

    const handleCancelReject = () => {
        setShowRejectConfirm(false);
    };

    const handleMarkCalled = () => {
        markCalledMutation.mutate(order.id, {
            onSuccess: () => {
                // Might choose not to close the modal here to allow immediate approve/reject
            }
        });
    };

    const scoreColor = getFraudScoreColor(order.fraudScore);
    const scoreTextClass = scoreColor === 'green' ? 'text-emerald-600' : scoreColor === 'yellow' ? 'text-amber-500' : 'text-red-600';
    const scoreBgClass = scoreColor === 'green' ? 'bg-emerald-50' : scoreColor === 'yellow' ? 'bg-amber-50' : 'bg-red-50';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-slate-800">
                                Order {order.orderNumber}
                            </h2>
                            <ReviewStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-slate-500">
                            Customer: {order.customerName} {order.customerEmail ? `(${order.customerEmail})` : ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Two-column top section */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Order Details */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Order Details</h3>
                            <div className="bg-slate-50 rounded-lg p-4 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Value</span>
                                    <span className="font-medium text-slate-800">₹{order.orderValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Payment</span>
                                    <span className="font-medium text-slate-800">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Pincode</span>
                                    <span className="font-medium text-slate-800">{order.shippingPincode || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Order History</span>
                                    <span className="font-medium text-slate-800">{order.customerOrderCount || 0} previous</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Chargeback History</span>
                                    {order.chargebackHistory ? (
                                        <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                            <AlertTriangle className="w-4 h-4" /> Yes
                                        </span>
                                    ) : (
                                        <span className="text-emerald-600 font-medium">None</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fraud Score */}
                        <div className="flex flex-col items-center justify-center space-y-2 bg-slate-50 rounded-lg p-6">
                            <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider mb-2">Fraud Score</h3>
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${scoreColor === 'green' ? 'border-emerald-200' : scoreColor === 'yellow' ? 'border-amber-200' : 'border-red-200'} ${scoreBgClass}`}>
                                <span className={`text-4xl font-bold ${scoreTextClass}`}>{order.fraudScore}</span>
                            </div>
                            <span className={`text-sm font-semibold uppercase ${scoreTextClass}`}>
                                Risk: {order.riskLevel}
                            </span>
                        </div>
                    </div>

                    {/* Rule Breakdown */}
                    <div>
                        <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider mb-4">Rule Contributions</h3>
                        {order.ruleContributions.length > 0 ? (
                            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100 overflow-hidden">
                                {order.ruleContributions.map((rule, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 transition-colors">
                                        <span className="text-sm font-medium text-slate-700">{rule.ruleName}</span>
                                        <span className="text-sm font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                                            +{rule.points} pts
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-500">No specific rules triggered.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                    {showRejectConfirm ? (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-red-100 text-red-600 rounded-full">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-red-900 text-sm mb-1">Reject this order?</h4>
                                    <p className="text-xs text-red-700 mb-3">
                                        This order will be permanently rejected. This action cannot be undone.
                                    </p>
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={handleCancelReject}
                                            disabled={isMutating}
                                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmReject}
                                            disabled={isMutating}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[120px]"
                                        >
                                            {rejectMutation.isPending ? 'Rejecting...' : 'Reject Order'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                {canMarkCalled && (
                                    <button
                                        onClick={handleMarkCalled}
                                        disabled={isMutating}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                                    >
                                        <Phone className="w-4 h-4" />
                                        {markCalledMutation.isPending ? 'Marking...' : 'Mark Called'}
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                {canReject && (
                                    <button
                                        onClick={handleRejectClick}
                                        disabled={isMutating}
                                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-red-700 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Reject
                                    </button>
                                )}
                                {canApprove && (
                                    <button
                                        onClick={handleApprove}
                                        disabled={isMutating}
                                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm shadow-emerald-600/20"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        {approveMutation.isPending ? 'Approving...' : 'Approve'}
                                    </button>
                                )}
                                {isTerminalState && (
                                    <span className="text-sm font-medium text-slate-500 bg-slate-200 px-4 py-2 rounded-lg">
                                        Action Completed
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
