'use client';

import React from 'react';

interface FraudScoreBadgeProps {
    score: number;
}

export function FraudScoreBadge({ score }: FraudScoreBadgeProps) {
    let colorClass: string;
    let label: string;

    if (score <= 30) {
        colorClass = 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
        label = 'Low';
    } else if (score <= 60) {
        colorClass = 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
        label = 'Med';
    } else {
        colorClass = 'bg-red-50 text-red-700 ring-1 ring-red-200';
        label = 'High';
    }

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}
            title={`Fraud Score: ${score}`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${score <= 30 ? 'bg-emerald-500' : score <= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
            />
            {score} · {label}
        </span>
    );
}
