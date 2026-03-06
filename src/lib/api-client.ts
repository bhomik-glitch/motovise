import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
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

// Response Interceptor: Structured error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
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
