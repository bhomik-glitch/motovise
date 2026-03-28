'use client';

import React, { useState } from 'react';
import { ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useManualReviewQueue } from './hooks/useManualReviewQueue';
import { ReviewQueueTable } from './components/ReviewQueueTable';
import { ScoreBreakdownModal } from './components/ScoreBreakdownModal';
import type { ManualReviewQueueItem } from './manualReview.types';

export function ManualReviewPage() {
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data, isLoading } = useManualReviewQueue({ page, limit });

    const [selectedOrder, setSelectedOrder] = useState<ManualReviewQueueItem | null>(null);

    const orders = data?.data || [];
    const totalPages = data ? Math.ceil(data.total / limit) : 1;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Manual Review Queue
                    </h1>
                </div>
                <p className="text-sm text-slate-500 ml-[52px]">
                    Suspicious orders requiring manual verification
                </p>
            </div>

            {/* Content Area */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <ReviewQueueTable
                    orders={orders}
                    isLoading={isLoading}
                    onRowClick={(order) => setSelectedOrder(order)}
                />

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing <span className="font-medium text-slate-900">{orders.length}</span> results
                        {data?.total ? ` of ${data.total}` : ''}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1 || isLoading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium text-slate-700 min-w-[3ch] text-center">
                            {page}
                        </span>
                        <button
                            disabled={page >= totalPages || isLoading}
                            onClick={() => setPage((p) => p + 1)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {selectedOrder && (
                <ScoreBreakdownModal
                    order={selectedOrder}
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
