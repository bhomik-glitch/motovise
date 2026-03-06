'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ManualReviewPage } from '@/modules/admin/manualReview/ManualReviewPage';

export default function AdminManualReviewRoute() {
    return (
        <ProtectedRoute permission="manual_review.handle">
            <ManualReviewPage />
        </ProtectedRoute>
    );
}
