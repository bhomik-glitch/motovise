import React from 'react';
import type { ManualReviewStatus } from '../manualReview.types';

interface ReviewStatusBadgeProps {
    status: ManualReviewStatus;
}

const STATUS_CONFIG: Record<ManualReviewStatus, { label: string; className: string }> = {
    PENDING: {
        label: 'Pending',
        className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    },
    APPROVED: {
        label: 'Approved',
        className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    },
    REJECTED: {
        label: 'Rejected',
        className: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    },
    CALLED: {
        label: 'Called',
        className: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    },
};

export function ReviewStatusBadge({ status }: ReviewStatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    if (!config) return null;

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config.className}`}
        >
            {config.label}
        </span>
    );
}
