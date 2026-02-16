"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.Node }) {
    return <SessionProvider>{children}</SessionProvider>;
}
