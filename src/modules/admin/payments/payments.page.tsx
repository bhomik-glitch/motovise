'use client';

import React, { useState, useCallback } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { usePayments } from './hooks/usePayments';
import { PaymentsTable } from './components/PaymentsTable';
import { PaymentsFilters } from './components/PaymentsFilters';
import { PaymentAttemptsModal } from './components/PaymentAttemptsModal';
import { PaginationControls } from '@/modules/admin/orders/components/PaginationControls';
import type {
    Payment,
    PaymentsQueryParams,
    PaymentGatewayStatus,
    PaymentGatewayMethod,
} from './payments.types';

type FiltersState = Omit<PaymentsQueryParams, 'page' | 'limit'>;

const DEFAULT_FILTERS: FiltersState = {
    status: '',
    method: '',
    dateFrom: '',
    dateTo: '',
    search: '',
};

const PAGE_LIMIT = 20;

export function PaymentsPage() {
    // ── Filters & pagination ───────────────────────────────
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);

    // ── Modal state ────────────────────────────────────────
    // Set to null on close to clear the query and prevent stale attempt data
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ── Query ──────────────────────────────────────────────
    const queryParams: PaymentsQueryParams = {
        page,
        limit: PAGE_LIMIT,
        status: filters.status as PaymentGatewayStatus | undefined,
        method: filters.method as PaymentGatewayMethod | undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        search: filters.search || undefined,
    };

    const { data, isLoading, isError, refetch } = usePayments(queryParams);

    const payments: Payment[] = data?.data ?? [];
    const total = data?.total ?? 0;

    // ── Handlers ───────────────────────────────────────────
    const handleFiltersChange = useCallback((newFilters: FiltersState) => {
        setFilters(newFilters);
        setPage(1); // reset to page 1 on any filter change
    }, []);

    const handleViewAttempts = useCallback((payment: Payment) => {
        setSelectedPaymentId(payment.id);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        // Reset ID immediately — this disables the usePaymentAttempts query
        // so the next modal open starts with a fresh fetch (no stale data)
        setSelectedPaymentId(null);
    }, []);

    return (
        <div className="space-y-5">
            {/* Page header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Payments Monitoring</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Inspect payment records, verify Razorpay transactions, and monitor chargebacks.
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                    aria-label="Refresh payments"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <PaymentsFilters filters={filters} onChange={handleFiltersChange} />
            </div>

            {/* Error state */}
            {isError && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Failed to load payments. Check your connection and try again.
                    <button
                        onClick={() => refetch()}
                        className="ml-auto underline hover:no-underline font-medium"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <PaymentsTable
                    payments={payments}
                    isLoading={isLoading}
                    onViewAttempts={handleViewAttempts}
                />
            </div>

            {/* Pagination */}
            {!isLoading && total > 0 && (
                <PaginationControls
                    page={page}
                    limit={PAGE_LIMIT}
                    total={total}
                    onPageChange={setPage}
                />
            )}

            {/* Payment Attempts Modal */}
            <PaymentAttemptsModal
                paymentId={selectedPaymentId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
}
