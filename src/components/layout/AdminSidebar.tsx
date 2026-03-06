// ─────────────────────────────────────────────────────────
// components/layout/AdminSidebar.tsx — Placeholder
// Phase A2: Replace with permission-driven navigation links.
// ─────────────────────────────────────────────────────────

'use client';

export function AdminSidebar() {
    return (
        <aside
            style={{
                width: '240px',
                minHeight: '100vh',
                background: '#0f0f0f',
                color: '#fff',
                padding: '1.5rem 1rem',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* ── Logo placeholder ── */}
            <div
                style={{
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    letterSpacing: '0.05em',
                    marginBottom: '2rem',
                    color: '#e5e5e5',
                }}
            >
                ⚙ Admin Panel
            </div>

            {/* ── Navigation placeholder ── */}
            {/* TODO (Phase A2): Render permission-driven nav links here.
          Use hasPermission() from useAuth() to conditionally show items. */}
            <nav style={{ flex: 1 }}>
                <p
                    style={{
                        fontSize: '0.75rem',
                        color: '#555',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}
                >
                    Navigation — Phase A2
                </p>
            </nav>
        </aside>
    );
}
