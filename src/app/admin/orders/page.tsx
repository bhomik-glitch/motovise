'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { OrdersPage } from '@/modules/admin/orders/components/OrdersPage';

export default function AdminOrdersPage() {
    return (
        <ProtectedRoute permission="order.read">
            <OrdersPage />
        </ProtectedRoute>
    );
}
