'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import {
    useCancelOrder,
    useShipOrder,
    useApproveReview,
    useRejectReview,
    useMarkCalled,
} from '../hooks/useOrderMutations';
import type { Order } from '../orders.types';
import { CANCELLABLE_STATUSES, SHIPPABLE_STATUSES } from '../orders.types';

interface ActionButtonProps {
    label: string;
    onClick: () => void;
    isLoading: boolean;
    variant: 'danger' | 'primary' | 'success' | 'warning' | 'secondary';
    icon?: React.ReactNode;
}

function ActionButton({ label, onClick, isLoading, variant, icon }: ActionButtonProps) {
    const variantClass = {
        danger: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
        primary: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
        secondary: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
    }[variant];

    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${variantClass}`}
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
            {label}
        </button>
    );
}

interface OrderActionsPanelProps {
    order: Order;
    onToast: (message: string, type: 'success' | 'error') => void;
    onClose: () => void;
}

export function OrderActionsPanel({ order, onToast, onClose }: OrderActionsPanelProps) {
    const { hasPermission } = useAuthContext();

    const cancelOrder = useCancelOrder();
    const shipOrder = useShipOrder();
    const approveReview = useApproveReview();
    const rejectReview = useRejectReview();
    const markCalled = useMarkCalled();

    // ── Permission flags ──────────────────────────────────
    const canCancel = hasPermission('ORDER_CANCEL');
    const canShip = hasPermission('ORDER_SHIP');
    const canReview = hasPermission('MANUAL_REVIEW_HANDLE');

    // ── Lifecycle guards ──────────────────────────────────
    const isCancellable = CANCELLABLE_STATUSES.includes(order.orderStatus);
    const isShippable = SHIPPABLE_STATUSES.includes(order.orderStatus);
    const hasReviewPending = order.manualReviewStatus === 'PENDING';

    // ── Handlers with lifecycle guard ─────────────────────
    const handleCancel = async () => {
        if (!isCancellable) {
            onToast(`Cannot cancel an order with status "${order.orderStatus}".`, 'error');
            return;
        }
        try {
            await cancelOrder.mutateAsync(order.id);
            onToast('Order cancelled successfully.', 'success');
            onClose();
        } catch {
            onToast('Failed to cancel order. Please try again.', 'error');
        }
    };

    const handleShip = async () => {
        if (!isShippable) {
            onToast(`Cannot ship an order with status "${order.orderStatus}".`, 'error');
            return;
        }
        try {
            await shipOrder.mutateAsync(order.id);
            onToast('Order marked as shipped.', 'success');
            onClose();
        } catch {
            onToast('Failed to ship order. Please try again.', 'error');
        }
    };

    const handleApprove = async () => {
        if (!hasReviewPending) {
            onToast('Review is not in PENDING state.', 'error');
            return;
        }
        try {
            await approveReview.mutateAsync(order.id);
            onToast('Manual review approved.', 'success');
            onClose();
        } catch {
            onToast('Failed to approve review.', 'error');
        }
    };

    const handleReject = async () => {
        if (!hasReviewPending) {
            onToast('Review is not in PENDING state.', 'error');
            return;
        }
        try {
            await rejectReview.mutateAsync(order.id);
            onToast('Manual review rejected.', 'success');
            onClose();
        } catch {
            onToast('Failed to reject review.', 'error');
        }
    };

    const handleMarkCalled = async () => {
        try {
            await markCalled.mutateAsync(order.id);
            onToast('Marked as called.', 'success');
        } catch {
            onToast('Failed to mark called.', 'error');
        }
    };

    const hasAnyAction =
        (canCancel && isCancellable) ||
        (canShip && isShippable) ||
        (canReview && hasReviewPending);

    if (!hasAnyAction) return null;

    return (
        <div className="border-t border-slate-100 pt-4 mt-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Actions
            </h4>
            <div className="flex flex-wrap gap-2">
                {canCancel && isCancellable && (
                    <ActionButton
                        label="Cancel Order"
                        onClick={handleCancel}
                        isLoading={cancelOrder.isPending}
                        variant="danger"
                        icon={<AlertTriangle className="w-4 h-4" />}
                    />
                )}

                {canShip && isShippable && (
                    <ActionButton
                        label="Mark Shipped"
                        onClick={handleShip}
                        isLoading={shipOrder.isPending}
                        variant="primary"
                    />
                )}

                {canReview && hasReviewPending && (
                    <>
                        <ActionButton
                            label="Approve Review"
                            onClick={handleApprove}
                            isLoading={approveReview.isPending}
                            variant="success"
                        />
                        <ActionButton
                            label="Reject Review"
                            onClick={handleReject}
                            isLoading={rejectReview.isPending}
                            variant="warning"
                        />
                        <ActionButton
                            label="Mark Called"
                            onClick={handleMarkCalled}
                            isLoading={markCalled.isPending}
                            variant="secondary"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
