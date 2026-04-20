'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ProductsPage } from '@/modules/admin/products/ProductsPage';

export default function AdminProductsPage() {
    // Assuming product.read is needed to view the page, based on the RBAC architecture
    return (
        <ProtectedRoute permission="product.read">
            <ProductsPage />
        </ProtectedRoute>
    );
}
