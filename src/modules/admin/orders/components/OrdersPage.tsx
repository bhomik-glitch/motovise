'use client';

import React, { useState, useCallback } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { OrdersTable } from './OrdersTable';
import { OrdersFilters } from './OrdersFilters';
import { PaginationControls } from './PaginationControls';
import { OrderDetailDrawer } from './OrderDetailDrawer';
import type { Order, OrdersQueryParams, OrderStatus, RiskLevel, PaymentMethod } from '../orders.types';

// ── Toast state ────────────────────────────────────────────
interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

let toastCounter = 0;

export function OrdersPage() {
    // ── Filters & pagination ───────────────────────────────
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<Omit<OrdersQueryParams, 'page' | 'limit'>>({
        status: '',
        riskLevel: '',
        paymentMethod: '',
        search: '',
    });

    // ── Drawer state ───────────────────────────────────────
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // ── Toast state ────────────────────────────────────────
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: 'success' | 'error') => {
        const id = ++toastCounter;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    // ── Query ──────────────────────────────────────────────
    const queryParams: OrdersQueryParams = {
        page,
        limit: 20,
        status: filters.status as OrderStatus | undefined,
        riskLevel: filters.riskLevel as RiskLevel | undefined,
        paymentMethod: filters.paymentMethod as PaymentMethod | undefined,
        search: filters.search,
    };

    const { data, isLoading, isError, refetch } = useOrders(queryParams);

    const orders: Order[] = data?.data ?? [];
    const total = data?.total ?? 0;

    // ── Handlers ───────────────────────────────────────────
    const handleFiltersChange = (newFilters: typeof filters) => {
        setFilters(newFilters);
        setPage(1); // reset to first page on filter change
    };

    const handleRowClick = (order: Order) => {
        setSelectedOrderId(order.id);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        // Slight delay before clearing ID so closing animation doesn't flash
        setTimeout(() => setSelectedOrderId(null), 300);
    };

    return (
        <div className="space-y-5">
            {/* Page header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Inspect orders, review fraud risk, and perform lifecycle actions.
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                    aria-label="Refresh orders"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <OrdersFilters filters={filters} onChange={handleFiltersChange} />
            </div>

            {/* Error state */}
            {isError && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Failed to load orders. Check your connection and try again.
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
                <OrdersTable
                    orders={orders}
                    isLoading={isLoading}
                    onRowClick={handleRowClick}
                />
            </div>

            {/* Pagination */}
            {!isLoading && total > 0 && (
                <PaginationControls
                    page={page}
                    limit={20}
                    total={total}
                    onPageChange={setPage}
                />
            )}

            {/* Detail Drawer */}
            <OrderDetailDrawer
                orderId={selectedOrderId}
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                onToast={addToast}
            />

            {/* Toast notifications */}
            <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-in slide-in-from-bottom-4 ${toast.type === 'success'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-600 text-white'
                            }`}
                    >
                        <span>{toast.type === 'success' ? '✓' : '✕'}</span>
                        {toast.message}
                    </div>
                ))}
            </div>
        </div>
    );
}
