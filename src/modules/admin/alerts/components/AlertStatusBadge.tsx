import React from 'react';
import type { AlertStatus } from '../alerts.types';

interface AlertStatusBadgeProps {
    status: AlertStatus;
}

const STATUS_CONFIG: Record<AlertStatus, { color: string; dot: string; label: string }> = {
    ACTIVE: {
        color: 'bg-red-50 text-red-700 ring-1 ring-red-200',
        dot: 'bg-red-500',
        label: 'Active',
    },
    RESOLVED: {
        color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Resolved',
    },
};

export function AlertStatusBadge({ status }: AlertStatusBadgeProps) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.color}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
}
