import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
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
                console.log("NextAuth: Authorize attempt for", credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    console.log("NextAuth: Missing email or password");
                    throw new Error("Invalid credentials");
                }

                try {
                    // 1. First verify with local DB for speed and permissions include
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                    });

                    if (!user || !user.password) {
                        console.log("NextAuth: User not found or no password");
                        throw new Error("Invalid credentials");
                    }

                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isValid) {
                        console.log("NextAuth: Password mismatch");
                        throw new Error("Invalid credentials");
                    }

                    // 2. IMPORTANT: Call backend NestJS API to get their JWT
                    // This is needed for the backend JwtAuthGuard to work (e.g. for Cart)
                    // BACKEND_URL is server-side only (no NEXT_PUBLIC_) — never exposed to browser.
                    const backendUrl = process.env.BACKEND_URL;
                    if (!backendUrl) throw new Error("BACKEND_URL is not configured.");

                    const backendResponse = await axios.post(`${backendUrl}/v1/auth/login`, {
                        email: credentials.email,
                        password: credentials.password
                    });

                    const { accessToken } = backendResponse.data.data;

                    console.log("NextAuth: Authorize successful for", user.email);
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        accessToken: accessToken, // Attach backend JWT
                    };
                } catch (error: any) {
                    console.error("NextAuth: Authorize error (Backend likely down):", error.message);
                    throw new Error("Login service is currently unavailable. Please try again later.");
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
            }

            // Handle session updates
            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
                (session.user as any).accessToken = token.accessToken;
            }
            return session;
        },
    },
};
