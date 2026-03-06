import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { AuthProvider } from '@/context/AuthContext';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';

export default function RootAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <QueryProvider>
                <AdminLayout>{children}</AdminLayout>
                <Toaster position="top-right" />
            </QueryProvider>
        </AuthProvider>
    );
}
