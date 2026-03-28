'use client';

import React from 'react';
import type { RiskLevel } from '../orders.types';

interface RiskBadgeProps {
    level: RiskLevel;
}

const RISK_CONFIG: Record<RiskLevel, { color: string; dot: string; label: string }> = {
    LOW: {
        color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Low',
    },
    MEDIUM: {
        color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        dot: 'bg-amber-500',
        label: 'Medium',
    },
    HIGH: {
        color: 'bg-red-50 text-red-700 ring-1 ring-red-200',
        dot: 'bg-red-500',
        label: 'High',
    },
};

export function RiskBadge({ level }: RiskBadgeProps) {
    const config = RISK_CONFIG[level] ?? RISK_CONFIG.LOW;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.color}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
}
