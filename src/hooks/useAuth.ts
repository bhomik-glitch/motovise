'use client';

// ─────────────────────────────────────────────────────────
// hooks/useAuth.ts — Public hook to access AuthContext
// ─────────────────────────────────────────────────────────

import { useAuthContext } from '@/context/AuthContext';

/**
 * Access the admin auth context from any client component.
 *
 * @example
 * const { user, hasPermission, logout } = useAuth();
 */
export const useAuth = () => useAuthContext();
