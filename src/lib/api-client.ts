import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/nest/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request Interceptor: Add backend JWT from NextAuth session
api.interceptors.request.use(
    async (config) => {
        const session = await getSession();
        const accessToken = (session as any)?.user?.accessToken;

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log error for storefront monitoring
        console.error('[API Error]:', error.response?.data || error.message);

        // Handle specific status codes if necessary
        if (error.response?.status === 401) {
            // Token expired or invalid — force logout to clear stale session
            if (typeof window !== 'undefined') {
                signOut({ callbackUrl: '/login' });
            }
        }

        return Promise.reject(error);
    }
);

export default api;
