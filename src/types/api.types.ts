// ─────────────────────────────────────────────────────────
// API Types — Admin Panel
// Wrappers for all NestJS backend responses.
// ─────────────────────────────────────────────────────────

import type { AuthUser } from './auth.types';
import type { PermissionMatrix } from './permission.types';

/** Generic API response envelope from the NestJS backend. */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T;
    message?: string;
}

/** Shape of a backend error response. */
export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
}

/** Response from POST /auth/admin/refresh */
export interface RefreshResponse {
    accessToken: string;
}

/** Response from POST /auth/admin/login */
export interface LoginResponse {
    accessToken: string;
    user: AuthUser;
}

/** Response from GET /auth/admin/me/permissions */
export interface PermissionsResponse {
    permissions: string[];
}
