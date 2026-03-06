// ─────────────────────────────────────────────────────────
// services/auth.service.ts — Admin Auth API Calls
//
// Pure API wrappers — NO state, NO side effects.
// All state management belongs in AuthContext.
// ─────────────────────────────────────────────────────────

import api from '@/lib/api';
import type { LoginDTO, AuthUser } from '@/types/auth.types';
import type {
    LoginResponse,
    RefreshResponse,
    PermissionsResponse,
} from '@/types/api.types';

/**
 * POST /auth/admin/login
 * Returns access token + user profile.
 * Refresh token is set as HTTP-only cookie by the backend.
 */
export async function login(dto: LoginDTO): Promise<LoginResponse> {
    const { data } = await api.post<{ success: boolean; data: LoginResponse }>('/auth/login', dto);
    return data.data;
}

/**
 * POST /auth/admin/logout
 * Clears the HTTP-only refresh token cookie on the server.
 */
export async function logout(): Promise<void> {
    await api.post('/auth/logout');
}

/**
 * POST /auth/admin/refresh
 * Exchanges the HTTP-only refresh cookie for a new access token.
 * Called automatically by the axios interceptor — rarely called directly.
 */
export async function refresh(): Promise<RefreshResponse> {
    const { data } = await api.post<{ success: boolean; data: RefreshResponse }>('/auth/refresh');
    return data.data;
}

export async function getPermissions(): Promise<PermissionsResponse> {
    const { data } = await api.get<{ success: boolean; data: PermissionsResponse }>(
        '/auth/me/permissions'
    );
    return data.data;
}

/**
 * GET /v1/auth/me
 * Returns the current user profile.
 */
export async function getMe(): Promise<AuthUser> {
    const { data } = await api.get<{ success: boolean; data: AuthUser }>('/auth/me');
    return data.data;
}
