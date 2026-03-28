import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const path = req.nextUrl.pathname;

        // Admin routes — handled by internal AuthProvider + ProtectedRoute.
        // next-auth is NOT used for the admin panel in Phase A1.
        if (path.startsWith("/admin")) {
            return NextResponse.next();
        }

        const token = req.nextauth.token;

        // Manager routes — MANAGER or ADMIN role
        if (path.startsWith("/manager")) {
            if (
                (token?.role as unknown as string) !== "MANAGER" &&
                (token?.role as unknown as string) !== "ADMIN"
            ) {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname;

                // Admin routes — always allow (handled by React layer)
                if (path.startsWith("/admin")) {
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
        /**
         * Matches /admin/* EXCEPT /admin/login and /admin/403.
         * These two pages are publicly accessible — the React auth
         * layer (AuthProvider + ProtectedRoute) handles admin access control.
         *
         * Negative-lookahead: (?!login|403)
         */
        "/admin/((?!login|403).*)",
        "/manager/:path*",
        "/cart",
        "/checkout",
        "/orders/:path*",
        "/profile/:path*",
        "/account",
        "/account/:path*",
    ],
};
