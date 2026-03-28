import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Cache the session promise to avoid duplicate fetches for concurrent requests
let sessionPromise: Promise<any> | null = null;
let sessionCache: { token: string | null; expiry: number } | null = null;

function isTokenExpiringSoon(jwt: string): boolean {
    try {
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        return payload.exp * 1000 < Date.now() + 30_000; // within 30 s of expiry
    } catch {
        return true;
    }
}

async function getAccessToken(): Promise<string | null> {
    // Return cached token if still fresh AND not about to expire
    if (sessionCache && Date.now() < sessionCache.expiry) {
        if (!sessionCache.token || !isTokenExpiringSoon(sessionCache.token)) {
            return sessionCache.token;
        }
        // Token expiring soon — bust cache so getSession() triggers JWT-callback refresh
        sessionCache = null;
    }

    // Deduplicate concurrent session fetches
    if (!sessionPromise) {
        sessionPromise = getSession().finally(() => {
            sessionPromise = null;
        });
    }

    const session = await sessionPromise;
    const token =
        (session as any)?.accessToken ||
        (session as any)?.user?.accessToken ||
        null;

    sessionCache = { token, expiry: Date.now() + 30_000 };
    return token;
}

// Allow external code to bust the cache (e.g. after login/logout)
export function clearApiSessionCache() {
    sessionCache = null;
    sessionPromise = null;
}

// Request Interceptor: Add backend JWT from NextAuth session
api.interceptors.request.use(
    async (config) => {
        const accessToken = await getAccessToken();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: handle 401 retry + structured errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config;

        // On 401, bust session cache and retry once
        if (
            error?.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            clearApiSessionCache();

            const freshToken = await getAccessToken();
            if (freshToken) {
                originalRequest.headers.Authorization = `Bearer ${freshToken}`;
                return api(originalRequest);
            }
        }

        const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            "Unexpected server error";

        return Promise.reject({
            message,
            status: error?.response?.status,
        });
    }
);

export default api;
