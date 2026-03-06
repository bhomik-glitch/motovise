'use client';

// ─────────────────────────────────────────────────────────
// context/AuthContext.tsx — Admin Panel Auth Context
//
// Bootstrap flow (runs once on mount):
//   1. Check in-memory access token
//   2. If missing → attempt silent refresh (HTTP-only cookie)
//   3. If refresh fails → isBootstrapped:true, user:null → ProtectedRoute redirects
//   4. If refresh OK  → fetch permission matrix + user profile
//   5. Store user + permissions in state
//   6. Set isBootstrapped:true → UI is now unlocked
//
// isBootstrapped vs isLoading:
//   isBootstrapped — set ONCE on startup; never toggled by login/logout.
//   isLoading      — reflects the in-flight state of login/logout actions.
//
// Security contract:
//   ✅ Access token in memory only (setAccessToken from lib/api.ts)
//   ✅ Refresh token in HTTP-only cookie — not accessible from JS
//   ✅ No token ever touches localStorage
//   ✅ All state cleared synchronously BEFORE server logout call
// ─────────────────────────────────────────────────────────

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    clearAccessToken,
    getAccessToken,
    setAccessToken,
} from '@/lib/api';
import * as authService from '@/services/auth.service';
import type { AuthUser, LoginDTO } from '@/types/auth.types';
import type { PermissionMatrix } from '@/types/permission.types';

// ── Context shape ──────────────────────────────────────────

interface AuthContextValue {
    user: AuthUser | null;
    permissions: PermissionMatrix;
    /** True once the initial session check has completed — never resets. */
    isBootstrapped: boolean;
    /** True while a login or logout action is in-flight. */
    isLoading: boolean;
    isAuthenticated: boolean;
    hasPermission: (key: string) => boolean;
    login: (dto: LoginDTO) => Promise<void>;
    logout: () => Promise<void>;
}

// ── Context instance ───────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Module-level refresh singleton ─────────────────────────
// Ensures only ONE refresh HTTP call fires even if React strict-mode
// causes two bootstrap() invocations. Both mounts await the same promise.
// Once the promise settles, _pendingRefresh is cleared for future refreshes.

let _pendingRefresh: Promise<{ accessToken: string }> | null = null;

function deduplicatedRefresh(): Promise<{ accessToken: string }> {
    if (!_pendingRefresh) {
        _pendingRefresh = authService.refresh().finally(() => {
            _pendingRefresh = null;
        });
    }
    return _pendingRefresh;
}

// ── Provider ───────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [permissions, setPermissions] = useState<PermissionMatrix>({});
    // isBootstrapped: set once after the initial session check — never reset.
    const [isBootstrapped, setIsBootstrapped] = useState(false);
    // isLoading: reflects in-flight login/logout actions.
    const [isLoading, setIsLoading] = useState(false);
    // Guard: bootstrap runs exactly once even in React strict-mode double-mount.
    const bootstrapRan = useRef(false);

    // ── Bootstrap ────────────────────────────────────────────
    // Runs once on mount or when session becomes available. Restores session via session token or HTTP-only refresh cookie.
    useEffect(() => {
        if (bootstrapRan.current) return;

        // Wait for session to be determined before starting bootstrap if we don't have a token yet
        if (sessionStatus === 'loading') return;

        bootstrapRan.current = true;

        let cancelled = false;

        async function bootstrap() {
            try {
                // Step 1: check in-memory token.
                let token = getAccessToken();

                // Step 1b: If no in-memory token, check if we have one from NextAuth session
                if (!token && session?.user && (session.user as any).accessToken) {
                    const sessionToken = (session.user as any).accessToken;
                    setAccessToken(sessionToken);
                    token = sessionToken;
                    console.log('Context: Found accessToken in NextAuth session');
                }

                if (!token) {
                    // Step 2: attempt silent refresh using the HTTP-only cookie.
                    // Uses deduplicated call to prevent strict-mode token rotation race.
                    try {
                        const refreshData = await deduplicatedRefresh();
                        setAccessToken(refreshData.accessToken);
                        token = refreshData.accessToken;
                    } catch {
                        // Step 3: refresh failed → no valid session.
                        if (!cancelled) setIsBootstrapped(true);
                        return;
                    }
                }

                // Step 4: fetch permission matrix + user profile sequentially to avoid backend Prisma concurrent query locks.
                const meData = await authService.getMe();
                const permData = await authService.getPermissions();

                if (!cancelled) {
                    // Step 5: store user + permissions.
                    setUser(meData);

                    // Convert string[] from backend to Record<string, boolean>
                    console.log('Context: Raw permData.permissions →', permData.permissions);
                    const permissionMap = (permData.permissions as unknown as string[]).reduce(
                        (acc: Record<string, boolean>, key: string) => {
                            acc[key] = true;
                            return acc;
                        },
                        {}
                    );
                    console.log('Context: permissionMap →', permissionMap);
                    setPermissions(permissionMap);

                    console.log('Context: Bootstrap Success', { email: meData.email });
                }
            } catch (err) {
                console.error('Context: Bootstrap Error', err);
                // Any unexpected error — treat as unauthenticated.
                if (!cancelled) {
                    clearAccessToken();
                    setUser(null);
                    setPermissions({});
                    router.replace('/admin/login');
                }
            } finally {
                // Step 6: always mark bootstrap done — never repeat.
                if (!cancelled) {
                    setIsBootstrapped(true);
                    console.log('Context: Bootstrap Done');
                }
            }
        }

        bootstrap();

        return () => {
            cancelled = true;
            bootstrapRan.current = false;
        };
    }, [sessionStatus, session, router]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Login ─────────────────────────────────────────────────
    // Does NOT touch isBootstrapped — that flag belongs to the startup check only.
    const login = useCallback(async (dto: LoginDTO) => {
        setIsLoading(true);
        try {
            const response = await authService.login(dto);
            setAccessToken(response.accessToken);
            setUser(response.user);

            // Fetch permission matrix after successful login.
            const permData = await authService.getPermissions();

            // Convert string[] from backend to Record<string, boolean>
            console.log('Context: Login Raw permData.permissions →', permData.permissions);
            const permissionMap = (permData.permissions as unknown as string[]).reduce(
                (acc: Record<string, boolean>, key: string) => {
                    acc[key] = true;
                    return acc;
                },
                {}
            );
            console.log('Context: Login permissionMap →', permissionMap);
            setPermissions(permissionMap);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ── Logout ────────────────────────────────────────────────
    // Hard reset: frontend state is cleared BEFORE the server call.
    // Frontend treats logout as authoritative — the server call is best-effort.
    const logout = useCallback(async () => {
        // 1. Immediately destroy local state — do not wait for the server.
        clearAccessToken();
        setUser(null);
        setPermissions({});

        // 2. Clear NextAuth session and redirect to home
        await signOut({ callbackUrl: '/' });

        // 3. Attempt server-side cookie invalidation (best-effort).
        try {
            await authService.logout();
        } catch {
            // Swallow — local state is already cleared, user is already redirected.
        }
    }, []);

    // ── Permission check ──────────────────────────────────────
    const hasPermission = useCallback(
        (key: string): boolean => {
            return permissions[key] === true;
        },
        [permissions]
    );

    // ── Context value (memoised) ──────────────────────────────
    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            permissions,
            isBootstrapped,
            isLoading,
            isAuthenticated: !!user,
            hasPermission,
            login,
            logout,
        }),
        [user, permissions, isBootstrapped, isLoading, hasPermission, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Internal hook (used only within this module + useAuth.ts) ─

export function useAuthContext(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuthContext must be used inside <AuthProvider>');
    }
    return ctx;
}

export { AuthContext };
