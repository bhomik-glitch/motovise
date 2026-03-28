'use client';

import React from 'react';
import { ShieldAlert, AlertOctagon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { AlertTypeBadge } from './AlertTypeBadge';
import { AlertStatusBadge } from './AlertStatusBadge';
import { AlertCooldownIndicator } from './AlertCooldownIndicator';
import type { Alert } from '../alerts.types';

interface AlertsTableProps {
    alerts: Alert[];
    isLoading: boolean;
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b border-slate-100">
            {Array.from({ length: 8 }).map((_, i) => (
                <td key={i} className="px-4 py-3.5">
                    <div className="h-4 bg-slate-100 rounded w-full" />
                </td>
            ))}
        </tr>
    );
}

function formatDate(iso: string) {
    try {
        return format(new Date(iso), 'dd MMM yy, HH:mm');
    } catch {
        return iso;
    }
}

export function AlertsTable({ alerts, isLoading }: AlertsTableProps) {
    if (!isLoading && alerts.length === 0) {
        return (
            <div className="w-full bg-white border border-slate-200 rounded-lg p-12 text-center">
                <div className="flex flex-col items-center gap-3 text-emerald-600">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <p className="font-medium">No active alerts</p>
                    <p className="text-sm text-slate-500">System operating normally</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        {[
                            'Alert ID',
                            'Type',
                            'Status',
                            'Pincode',
                            'Risk %',
                            'Threshold',
                            'Created',
                            'Cooldown',
                        ].map((col) => (
                            <th
                                key={col}
                                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap"
                            >
                                {col === 'Created' ? (
                                    <span className="inline-flex items-center gap-1 cursor-pointer hover:text-gray-900">
                                        {col}
                                        <ChevronDown className="w-3 h-3" />
                                    </span>
                                ) : (
                                    col
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {isLoading &&
                        Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                    {!isLoading &&
                        alerts.map((alert) => (
                            <tr
                                key={alert.id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-4 py-3.5">
                                    <span className="font-mono text-xs font-semibold text-gray-900">
                                        {alert.id.split('-')[0] || alert.id}
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 whitespace-nowrap">
                                    <AlertTypeBadge type={alert.type} />
                                </td>
                                <td className="px-4 py-3.5 whitespace-nowrap">
                                    <AlertStatusBadge status={alert.status} />
                                </td>
                                <td className="px-4 py-3.5 font-medium text-gray-900">
                                    {alert.pincode}
                                </td>
                                <td className="px-4 py-3.5">
                                    <span className={`font-semibold ${Number(alert.metricValue) >= Number(alert.thresholdValue) ? 'text-red-600' : 'text-amber-600'}`}>
                                        {alert.metricValue}%
                                    </span>
                                </td>
                                <td className="px-4 py-3.5 text-gray-500 font-medium">
                                    {alert.thresholdValue}%
                                </td>
                                <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-xs font-medium">
                                    {formatDate(alert.createdAt)}
                                </td>
                                <td className="px-4 py-3.5 whitespace-nowrap">
                                    {alert.status === 'ACTIVE' ? (
                                        <AlertCooldownIndicator createdAt={alert.createdAt} cooldownHours={24} />
                                    ) : (
                                        <span className="text-xs text-gray-500 font-medium">Resolved at {alert.resolvedAt ? formatDate(alert.resolvedAt) : 'N/A'}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}
