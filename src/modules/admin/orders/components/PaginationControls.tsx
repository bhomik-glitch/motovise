'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
}

export function PaginationControls({ page, limit, total, onPageChange }: PaginationControlsProps) {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const isFirstPage = page <= 1;
    const isLastPage = page >= totalPages;

    // Show max 7 page numbers, with ellipsis if needed
    const getPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages: (number | '...')[] = [];
        if (page <= 4) {
            pages.push(1, 2, 3, 4, 5, '...', totalPages);
        } else if (page >= totalPages - 3) {
            pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
        }
        return pages;
    };

    const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    return (
        <div className="flex items-center justify-between px-1">
            <p className="text-sm text-slate-500">
                {total === 0 ? 'No results' : `${startItem}–${endItem} of ${total.toLocaleString()} orders`}
            </p>

            <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={isFirstPage}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((p, idx) =>
                    p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="w-8 text-center text-slate-400 text-sm">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors ${p === page
                                    ? 'bg-blue-600 text-white border border-blue-600'
                                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            aria-current={p === page ? 'page' : undefined}
                        >
                            {p}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={isLastPage}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
