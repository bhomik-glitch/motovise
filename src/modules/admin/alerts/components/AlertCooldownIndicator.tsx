import React from 'react';

interface AlertCooldownIndicatorProps {
    createdAt: string;
    cooldownHours?: number; // default to 24
}

export function AlertCooldownIndicator({ createdAt, cooldownHours = 24 }: AlertCooldownIndicatorProps) {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const expiresAt = new Date(createdDate.getTime() + cooldownHours * 60 * 60 * 1000);
    const remainingMs = expiresAt.getTime() - now.getTime();

    if (remainingMs <= 0) {
        return (
            <div className="flex flex-col">
                <span className="text-xs text-slate-500">Cooldown: {cooldownHours}h</span>
                <span className="text-xs font-medium text-emerald-600">Ready</span>
            </div>
        );
    }

    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    // Format remaining time nicely
    let remainingText = '';
    if (remainingHours > 0) {
        remainingText = `${remainingHours}h ${remainingMinutes}m`;
    } else {
        remainingText = `${remainingMinutes}m`;
    }

    return (
        <div className="flex flex-col">
            <span className="text-xs text-slate-500">Cooldown: {cooldownHours}h</span>
            <span className="text-xs font-medium text-amber-600">Remaining: {remainingText}</span>
        </div>
    );
}
