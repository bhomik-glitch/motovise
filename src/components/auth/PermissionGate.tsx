'use client';

// ─────────────────────────────────────────────────────────
// components/auth/PermissionGate.tsx
//
// Inline permission guard — renders children only when the
// current user has the required permission. No redirect.
// Use this for hiding UI elements (buttons, table actions).
//
// Usage:
//   <PermissionGate permission="PRODUCT_EDIT">
//     <EditButton />
//   </PermissionGate>
//
//   <PermissionGate permission="ORDER_DELETE" fallback={<DisabledBtn />}>
//     <DeleteButton />
//   </PermissionGate>
// ─────────────────────────────────────────────────────────

import { useAuth } from '@/hooks/useAuth';

interface PermissionGateProps {
    permission: string;
    children: React.ReactNode;
    /** Optional: what to render when permission is denied. Defaults to null. */
    fallback?: React.ReactNode;
}

export function PermissionGate({
    permission,
    children,
    fallback = null,
}: PermissionGateProps) {
    const { isLoading, hasPermission } = useAuth();

    // Do not render during bootstrap — avoids flicker.
    if (isLoading) return null;

    if (!hasPermission(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
