// ─────────────────────────────────────────────────────────
// Auth Types — Admin Panel
// Access tokens are NEVER stored in localStorage.
// They live only in module-level memory (lib/api.ts).
// ─────────────────────────────────────────────────────────

/** Roles supported by the RBAC system. */
export type Role = 'ADMIN' | 'FINANCE' | 'SUPPORT' | 'CEO';

/** Payload sent to the login endpoint. */
export interface LoginDTO {
    email: string;
    password: string;
}

/** Authenticated user shape (stored in React state, not localStorage). */
export interface AuthUser {
    id: string;
    email: string;
    role: Role;
}

/** Shape of the AuthContext value. */
export interface AuthState {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}
