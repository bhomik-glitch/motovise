import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import axios from "axios";

// Define UserRole locally if Prisma export is failing in this environment
export enum UserRole {
    CUSTOMER = "CUSTOMER",
    MANAGER = "MANAGER",
    ADMIN = "ADMIN",
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const res = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
                        {
                            email: credentials.email,
                            password: credentials.password,
                        }
                    );

                    if (res.data.success) {
                        // Extract refresh token from Set-Cookie header
                        // (login is server-to-server, so the cookie never reaches the browser;
                        //  we store it in the NextAuth JWT instead)
                        const setCookies: string[] = res.headers['set-cookie'] || [];
                        let refreshToken = '';
                        for (const cookie of setCookies) {
                            const match = cookie.match(/refreshToken=([^;]+)/);
                            if (match) { refreshToken = match[1]; break; }
                        }

                        return {
                            ...res.data.data.user,
                            accessToken: res.data.data.accessToken,
                            refreshToken,
                        };
                    }

                    return null;
                } catch (error: unknown) {
                    const message = error instanceof Error ? error.message : "Authentication failed";
                    console.error("NextAuth: Login failed:", message);
                    return null;
                }
            },
        }),
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [
                GoogleProvider({
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                }),
            ]
            : []),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.accessToken = (user as any).accessToken;
                token.refreshToken = (user as any).refreshToken;
            }

            // Handle session updates
            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }

            // Auto-refresh expired backend access token
            if (token.accessToken && typeof token.accessToken === 'string') {
                try {
                    const payload = JSON.parse(
                        Buffer.from(token.accessToken.split('.')[1], 'base64').toString()
                    );
                    const nowSec = Math.floor(Date.now() / 1000);

                    if (payload.exp && payload.exp < nowSec + 60 && token.refreshToken) {
                        const refreshRes = await axios.post(
                            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                            {},
                            { headers: { Cookie: `refreshToken=${token.refreshToken}` } }
                        );
                        const newAccessToken = refreshRes.data?.data?.accessToken;
                        if (newAccessToken) {
                            token.accessToken = newAccessToken;
                            // Capture rotated refresh token from Set-Cookie
                            const cookies: string[] = refreshRes.headers?.['set-cookie'] || [];
                            for (const c of cookies) {
                                const m = c.match(/refreshToken=([^;]+)/);
                                if (m) { token.refreshToken = m[1]; break; }
                            }
                        }
                    }
                } catch {
                    // Refresh failed — clear tokens so the user is prompted to re-login
                    token.accessToken = null;
                    token.refreshToken = null;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
                (session.user as any).accessToken = token.accessToken;
                (session as any).accessToken = token.accessToken;
            }
            console.log("SESSION DEBUG:", JSON.stringify({ hasAccessToken: !!(token.accessToken), userId: token.id }));
            return session;
        },
    },
};
