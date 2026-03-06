'use client';

import React from 'react';
import { X, Loader2, AlertTriangle, CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { usePaymentAttempts } from '../hooks/usePaymentAttempts';
import type { PaymentGatewayStatus } from '../payments.types';

interface PaymentAttemptsModalProps {
    paymentId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

// ── Helpers ────────────────────────────────────────────────

function formatDate(iso: string) {
    try {
        return format(new Date(iso), 'dd MMM yyyy, HH:mm:ss');
    } catch {
        return iso;
    }
}

function StatusIcon({ status }: { status: PaymentGatewayStatus }) {
    if (status === 'SUCCESS') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === 'FAILED') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
}

const STATUS_LABEL: Record<PaymentGatewayStatus, string> = {
    SUCCESS: 'text-emerald-700',
    FAILED: 'text-red-700',
    PENDING: 'text-amber-700',
};

// ── Main component ─────────────────────────────────────────

export function PaymentAttemptsModal({ paymentId, isOpen, onClose }: PaymentAttemptsModalProps) {
    const { data: attempts, isLoading, isError } = usePaymentAttempts(paymentId);

    if (!isOpen) return null;

    return (
        /* Overlay */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Panel */}
            <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-900">Payment Attempts</h2>
                            {paymentId && (
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{paymentId}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Loading */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-sm">Loading payment attempts…</span>
                        </div>
                    )}

                    {/* Error */}
                    {isError && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            Failed to load payment attempts.
                        </div>
                    )}

                    {/* Empty */}
                    {!isLoading && !isError && attempts && attempts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                            <CreditCard className="w-8 h-8" />
                            <p className="text-sm font-medium text-slate-500">No attempts recorded</p>
                        </div>
                    )}

                    {/* Attempts list */}
                    {!isLoading && !isError && attempts && attempts.length > 0 && (
                        <div className="space-y-3">
                            {attempts.map((attempt, idx) => (
                                <div
                                    key={attempt.id}
                                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all"
                                >
                                    {/* Attempt header row */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400 font-medium">#{idx + 1}</span>
                                            <StatusIcon status={attempt.status} />
                                            <span className={`text-xs font-semibold ${STATUS_LABEL[attempt.status]}`}>
                                                {attempt.status}
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            {formatDate(attempt.createdAt)}
                                        </span>
                                    </div>

                                    {/* Fields grid */}
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                                        <AttemptField label="Attempt ID" value={attempt.id} mono />
                                        <AttemptField label="Razorpay Payment ID" value={attempt.razorpayPaymentId} mono />
                                        <AttemptField label="Razorpay Order ID" value={attempt.razorpayOrderId} mono />
                                        <AttemptField label="Error Code" value={attempt.errorCode} />
                                        {attempt.gatewayResponse && (
                                            <div className="col-span-full">
                                                <dt className="text-slate-400 font-medium mb-1">Gateway Response</dt>
                                                <dd className="font-mono text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs whitespace-pre-wrap break-all">
                                                    {attempt.gatewayResponse}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Small helper ───────────────────────────────────────────

function AttemptField({
    label,
    value,
    mono = false,
}: {
    label: string;
    value?: string | null;
    mono?: boolean;
}) {
    return (
        <div>
            <dt className="text-slate-400 font-medium">{label}</dt>
            <dd className={`mt-0.5 text-slate-700 truncate ${mono ? 'font-mono' : ''}`}>
                {value ?? <span className="text-slate-300">—</span>}
            </dd>
        </div>
    );
}
