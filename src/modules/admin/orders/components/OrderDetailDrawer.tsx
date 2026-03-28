'use client';

import React, { useEffect, useRef } from 'react';
import { X, Package, CreditCard, ShieldAlert, Truck, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/utils';
import { FraudScoreBadge } from './FraudScoreBadge';
import { RiskBadge } from './RiskBadge';
import { OrderActionsPanel } from './OrderActionsPanel';
import { useOrderDetails } from '../hooks/useOrderDetails';
import type { Order } from '../orders.types';

interface OrderDetailDrawerProps {
    orderId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onToast: (message: string, type: 'success' | 'error') => void;
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-slate-100 text-slate-700',
    CONFIRMED: 'bg-blue-50 text-blue-700',
    PROCESSING: 'bg-indigo-50 text-indigo-700',
    SHIPPED: 'bg-cyan-50 text-cyan-700',
    DELIVERED: 'bg-emerald-50 text-emerald-700',
    CANCELLED: 'bg-red-50 text-red-700',
    RETURNED: 'bg-orange-50 text-orange-700',
    REFUNDED: 'bg-purple-50 text-purple-700',
};

const REVIEW_STATUS_COLORS: Record<string, string> = {
    NONE: 'bg-slate-100 text-slate-600',
    PENDING: 'bg-amber-50 text-amber-700',
    APPROVED: 'bg-emerald-50 text-emerald-700',
    REJECTED: 'bg-red-50 text-red-700',
};

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-slate-400">{icon}</span>
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{title}</h3>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">{children}</div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-slate-500 shrink-0">{label}</span>
            <span className="text-sm text-slate-800 font-medium text-right">{value}</span>
        </div>
    );
}

function formatDate(iso: string) {
    try {
        return format(new Date(iso), 'dd MMM yyyy, HH:mm');
    } catch {
        return iso;
    }
}


export function OrderDetailDrawer({ orderId, isOpen, onClose, onToast }: OrderDetailDrawerProps) {
    const { data: order, isLoading } = useOrderDetails(orderId);
    const overlayRef = useRef<HTMLDivElement>(null);

    // ESC key to close
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                ref={overlayRef}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer panel */}
            <div
                className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col"
                role="dialog"
                aria-modal="true"
                aria-label="Order details"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Order Details</h2>
                        {order && (
                            <p className="text-sm text-slate-500 mt-0.5">#{order.orderNumber}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        aria-label="Close drawer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {isLoading && (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    )}

                    {!isLoading && !order && (
                        <div className="flex items-center justify-center h-64 text-slate-400">
                            Order not found.
                        </div>
                    )}

                    {!isLoading && order && (
                        <>
                            {/* Order Summary */}
                            <Section title="Order Summary" icon={<Package className="w-4 h-4" />}>
                                <Row label="Order #" value={order.orderNumber} />
                                <Row label="Customer" value={order.customerName} />
                                {order.customerEmail && <Row label="Email" value={order.customerEmail} />}
                                <Row label="Created At" value={formatDate(order.createdAt)} />
                                <Row
                                    label="Order Status"
                                    value={
                                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${STATUS_COLORS[order.orderStatus] ?? 'bg-slate-100 text-slate-700'}`}>
                                            {order.orderStatus}
                                        </span>
                                    }
                                />
                                <Row label="Total Amount" value={<span className="font-bold text-slate-900">{formatPrice(order.totalAmount)}</span>} />
                            </Section>

                            {/* Items */}
                            {order.items && order.items.length > 0 && (
                                <Section title="Items" icon={<FileText className="w-4 h-4" />}>
                                    <div className="space-y-3">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{item.productName}</p>
                                                    <p className="text-xs text-slate-500">SKU: {item.sku} · Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-semibold text-slate-700">{formatPrice(item.totalPrice)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}

                            {/* Payment Details */}
                            <Section title="Payment Details" icon={<CreditCard className="w-4 h-4" />}>
                                <Row label="Method" value={order.paymentMethod} />
                                <Row
                                    label="Payment Status"
                                    value={
                                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' : order.paymentStatus === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                                            {order.paymentStatus}
                                        </span>
                                    }
                                />
                                <Row label="Chargeback" value={
                                    order.chargebackFlag ? (
                                        <span className="inline-flex items-center gap-1 text-red-600 font-semibold text-xs">
                                            ⚠️ Chargeback flagged
                                        </span>
                                    ) : (
                                        <span className="text-slate-500 text-xs">No chargeback</span>
                                    )
                                } />
                            </Section>

                            {/* Fraud Analysis */}
                            <Section title="Fraud Analysis" icon={<ShieldAlert className="w-4 h-4" />}>
                                <Row label="Fraud Score" value={<FraudScoreBadge score={order.fraudScore} />} />
                                <Row label="Risk Level" value={<RiskBadge level={order.riskLevel} />} />
                            </Section>

                            {/* Manual Review */}
                            <Section title="Manual Review" icon={<FileText className="w-4 h-4" />}>
                                <Row
                                    label="Review Status"
                                    value={
                                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${REVIEW_STATUS_COLORS[order.manualReviewStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {order.manualReviewStatus}
                                        </span>
                                    }
                                />
                            </Section>

                            {/* Shipment */}
                            {order.shipment && (
                                <Section title="Shipment" icon={<Truck className="w-4 h-4" />}>
                                    {order.shipment.carrier && <Row label="Carrier" value={order.shipment.carrier} />}
                                    {order.shipment.trackingNumber && <Row label="Tracking #" value={order.shipment.trackingNumber} />}
                                    {order.shipment.shippedAt && <Row label="Shipped At" value={formatDate(order.shipment.shippedAt)} />}
                                    {order.shipment.estimatedDelivery && <Row label="Est. Delivery" value={formatDate(order.shipment.estimatedDelivery)} />}
                                    {order.shipment.pincode && <Row label="Pincode" value={order.shipment.pincode} />}
                                </Section>
                            )}

                            {/* Actions Panel */}
                            <OrderActionsPanel
                                order={order}
                                onToast={onToast}
                                onClose={onClose}
                            />
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
