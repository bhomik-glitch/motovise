import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Admin routes - only ADMIN role
        if (path.startsWith("/admin")) {
            if (token?.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        // Manager routes - MANAGER or ADMIN role
        if (path.startsWith("/manager")) {
            if (token?.role !== "MANAGER" && token?.role !== "ADMIN") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname;

                // Public routes
                if (
                    path === "/" ||
                    path.startsWith("/products") ||
                    path.startsWith("/login") ||
                    path.startsWith("/register") ||
                    path.startsWith("/api/auth")
                ) {
                    return true;
                }

                // Protected routes require authentication
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: [
        "/admin/:path*",
        "/manager/:path*",
        "/cart",
        "/checkout",
        "/orders/:path*",
        "/profile/:path*",
    ],
};
