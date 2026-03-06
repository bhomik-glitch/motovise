// ─────────────────────────────────────────────────────────
// lib/api.ts — Central Axios Instance (Admin Panel)
//
// Security contract:
//   ✅ Access token stored ONLY in module memory (_accessToken)
//   ✅ Never written to localStorage or sessionStorage
//   ✅ Refresh token is HTTP-only cookie — never accessible from JS
//   ✅ Refresh concurrency lock prevents duplicate refresh calls
//   ✅ Retry limit (_retryCount > 1) prevents runaway refresh loops
// ─────────────────────────────────────────────────────────

import axios, {
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse, RefreshResponse } from '@/types/api.types';

// ── In-memory token store ──────────────────────────────────
// Access token lives ONLY here — never in localStorage.
let _accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
    _accessToken = token;
};

export const getAccessToken = (): string | null => _accessToken;

export const clearAccessToken = (): void => {
    _accessToken = null;
};

// ── Refresh concurrency lock ───────────────────────────────
// Only ONE refresh request fires at a time.
// All concurrent 401 requests queue behind the same promise.
let _isRefreshing = false;
type RefreshSuccessSubscriber = (token: string) => void;
type RefreshFailureSubscriber = (error: AxiosError) => void;
interface RefreshSubscriber {
    resolve: RefreshSuccessSubscriber;
    reject: RefreshFailureSubscriber;
}
let _refreshQueue: RefreshSubscriber[] = [];

const subscribeToRefresh = (resolve: RefreshSuccessSubscriber, reject: RefreshFailureSubscriber): void => {
    _refreshQueue.push({ resolve, reject });
};

const drainRefreshQueue = (newToken: string): void => {
    _refreshQueue.forEach(({ resolve }) => resolve(newToken));
    _refreshQueue = [];
};

const failRefreshQueue = (error: AxiosError): void => {
    _refreshQueue.forEach(({ reject }) => reject(error));
    _refreshQueue = [];
};

// ── Axios instance ─────────────────────────────────────────
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // sends HTTP-only refresh cookie automatically
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request interceptor ────────────────────────────────────
// Attaches the in-memory access token to every request.
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────
// Handles 401 → silent refresh → retry original request.
// Concurrency-safe: multiple simultaneous 401s share one refresh.

// Extend AxiosRequestConfig to track retry state.
interface RetryableRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
    /** Counts how many times this exact request has been retried after a 401. */
    _retryCount?: number;
}

api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequestConfig;

        const is401 = error.response?.status === 401;
        const alreadyRetried = originalRequest?._retry === true;
        const isAuthEndpoint = originalRequest?.url?.includes('/auth/refresh') || originalRequest?.url?.includes('/auth/login');
        // Hard limit: even if _retry is somehow reset, cap at 1 retry cycle.
        const retryCount = originalRequest?._retryCount ?? 0;
        const retryLimitExceeded = retryCount > 1;

        // 🔎 Bonus Fix: If refresh/login themselves return 401, it means the session is dead.
        // Force logout immediately to prevent infinite refresh cycles (Step 113).
        if (is401 && isAuthEndpoint) {
            clearAccessToken();
            failRefreshQueue(error);
            if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
                window.location.href = '/';
            }
            return Promise.reject(error);
        }

        // Do not retry: wrong status, already retried, no config, or limit hit.
        if (!is401 || alreadyRetried || !originalRequest || retryLimitExceeded) {
            return Promise.reject(error);
        }

        // ── Concurrency gate ──
        if (_isRefreshing) {
            // Queue this request — it will be replayed once refresh resolves or rejects.
            return new Promise<unknown>((resolve, reject) => {
                subscribeToRefresh(
                    (newToken: string) => {
                        if (originalRequest.headers) {
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        }
                        resolve(api(originalRequest));
                    },
                    (err) => reject(err)
                );
            });
        }

        // First 401: fire the refresh.
        originalRequest._retry = true;
        originalRequest._retryCount = retryCount + 1;
        _isRefreshing = true;

        try {
            const { data } = await api.post<ApiResponse<RefreshResponse>>(
                '/auth/refresh',
                {},
                { withCredentials: true }
            );

            const newToken = data.data.accessToken;
            setAccessToken(newToken);

            // Drain all queued requests with the new token.
            drainRefreshQueue(newToken);

            // Retry the original request.
            if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }
            return api(originalRequest);
        } catch (refreshError) {
            // Refresh failed — clear everything and force login.
            clearAccessToken();
            failRefreshQueue(refreshError as AxiosError);

            if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
                window.location.href = '/';
            }

            return Promise.reject(refreshError);
        } finally {
            _isRefreshing = false;
        }
    }
);

export default api;
