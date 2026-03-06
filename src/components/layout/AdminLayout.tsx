'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import Header from './Header';
import { Role } from '@/types/auth.types';

// The layout restricts access to administrative roles.
// Individual page permissions are handled by ProtectedRoute wrapper.
const ALLOWED_ROLES: Role[] = ['ADMIN', 'FINANCE', 'SUPPORT', 'CEO'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isBootstrapped, isAuthenticated, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isBootstrapped && isMounted && !isLoginPage) {
            if (!isAuthenticated) {
                router.replace('/admin/login');
            } else if (user && !ALLOWED_ROLES.includes(user.role)) {
                // Not an administrative role
                router.replace('/admin/403');
            }
        }
    }, [isBootstrapped, isAuthenticated, user, router, isMounted, isLoginPage]);

    // Render plain children for login page to avoid recursion and layout wrapping
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Do not render administrative UI until auth state is resolved and client is mounted
    if (!isBootstrapped || !isMounted || !isAuthenticated || !user) {
        return null; // Prevents generic layout flash
    }

    if (!ALLOWED_ROLES.includes(user.role)) {
        return null;
    }

    return (
        <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden">
            {/* Sidebar fixed width (260px) */}
            <Sidebar />

            <div className="flex flex-col flex-1 min-w-0">
                {/* Header fixed top */}
                <Header />

                {/* Content scrollable */}
                <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
