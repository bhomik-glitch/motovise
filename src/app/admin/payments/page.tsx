'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PaymentsPage } from '@/modules/admin/payments/payments.page';

export default function AdminPaymentsPage() {
    return (
        <ProtectedRoute permission="payment.read">
            <PaymentsPage />
        </ProtectedRoute>
    );
}
