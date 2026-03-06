import React from 'react';
import type { AlertType } from '../alerts.types';

interface AlertTypeBadgeProps {
    type: AlertType;
}

const TYPE_CONFIG: Record<AlertType, { color: string; label: string }> = {
    OVERALL_RTO: {
        color: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
        label: 'Overall RTO',
    },
    PINCODE_RTO: {
        color: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100',
        label: 'Pincode RTO',
    },
    CHARGEBACK_RATE: {
        color: 'bg-red-50 text-red-700 ring-1 ring-red-200',
        label: 'Chargeback Rate',
    },
    MANUAL_REVIEW_QUEUE: {
        color: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
        label: 'Manual Review Queue',
    },
};

export function AlertTypeBadge({ type }: AlertTypeBadgeProps) {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.OVERALL_RTO;

    return (
        <span
            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${config.color}`}
            title={type}
        >
            {config.label}
        </span>
    );
}
