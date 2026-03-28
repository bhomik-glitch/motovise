'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
    permission?: string;
    children: React.ReactNode;
}

export default function ProtectedRoute({ permission, children }: ProtectedRouteProps) {
    const { isBootstrapped, isAuthenticated, hasPermission } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isBootstrapped && isMounted) {
            if (!isAuthenticated) {
                router.replace('/admin/login');
            } else if (permission && !hasPermission(permission)) {
                router.replace('/admin/403');
            }
        }
    }, [isBootstrapped, isAuthenticated, permission, hasPermission, router, isMounted]);

    // Render nothing until client is mounted and auth is bootstrapped
    if (!isBootstrapped || !isMounted) {
        return null;
    }

    // Do not render children if auth failed or permission is missing
    if (!isAuthenticated) {
        return null;
    }

    if (permission && !hasPermission(permission)) {
        return null; // Prevents UI flash before redirect happens
    }

    return <>{children}</>;
}
