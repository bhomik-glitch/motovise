import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AdminAlertsPage } from '@/modules/admin/alerts/AdminAlertsPage';

export default function AlertsPage() {
    return (
        <ProtectedRoute permission="ALERT_VIEW">
            <AdminAlertsPage />
        </ProtectedRoute>
    );
}
