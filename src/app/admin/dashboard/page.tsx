'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import {
    DashboardMetrics,
    HighRiskPincodeTable,
    ActiveAlertsBanner,
    ManualReviewBadge,
    useDashboardMetrics
} from '@/modules/admin/dashboard';
import { AlertTriangle } from 'lucide-react';

// Simple ErrorBoundary as suggested by implementation steps
class ErrorBoundary extends Component<{ children: ReactNode; title?: string }, { hasError: boolean }> {
    constructor(props: { children: ReactNode; title?: string }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("Dashboard Widget Error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center text-slate-500">
                    <AlertTriangle className="w-5 h-5 mr-3 text-amber-500" />
                    <span>Failed to load {this.props.title || 'this widget'}.</span>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function DashboardPage() {
    const { user, hasPermission } = useAuth();
    const { metrics, highRiskPincodes, activeAlerts, isLoading } = useDashboardMetrics();
    const canViewAlerts = hasPermission('alerts.view');

    return (
        <ProtectedRoute permission="analytics.view">
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
                        <p className="text-slate-500">
                            Welcome back, <span className="font-semibold">{user?.email || 'User'}</span>
                        </p>
                    </div>
                </div>

                {canViewAlerts && (
                    <ErrorBoundary title="Alerts">
                        <ActiveAlertsBanner alerts={activeAlerts} isLoading={isLoading} />
                    </ErrorBoundary>
                )}

                <ErrorBoundary title="Manual Review Status">
                    <ManualReviewBadge manualReviewPending={metrics?.manualReviewPending || 0} isLoading={isLoading} />
                </ErrorBoundary>

                <ErrorBoundary title="Core Metrics">
                    <DashboardMetrics metrics={metrics} isLoading={isLoading} />
                </ErrorBoundary>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <ErrorBoundary title="High Risk Pincodes">
                            <HighRiskPincodeTable pincodes={highRiskPincodes} isLoading={isLoading} />
                        </ErrorBoundary>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
