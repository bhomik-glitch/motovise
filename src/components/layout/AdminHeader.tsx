'use client';

// ─────────────────────────────────────────────────────────
// components/layout/AdminHeader.tsx — Placeholder
// Phase A1: Adds user info + working logout button.
// ─────────────────────────────────────────────────────────

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function AdminHeader() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/admin/login');
    };

    return (
        <header
            style={{
                height: '56px',
                background: '#fff',
                borderBottom: '1px solid #e5e5e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem',
                position: 'sticky',
                top: 0,
                zIndex: 10,
            }}
        >
            <span style={{ fontSize: '0.875rem', color: '#555' }}>
                {user
                    ? `${user.email} · ${user.role}`
                    : 'Admin Panel'}
            </span>

            <button
                id="logout-button"
                onClick={handleLogout}
                style={{
                    padding: '0.375rem 0.875rem',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 500,
                }}
            >
                Sign Out
            </button>
        </header>
    );
}
