// ─────────────────────────────────────────────────────────
// app/admin/login/page.tsx — Admin Login Page
// This page is OUTSIDE the ProtectedRoute layout.
// ─────────────────────────────────────────────────────────

import LoginForm from './LoginForm';

export const metadata = {
    title: 'Sign In | Admin Panel',
};

export default function AdminLoginPage() {
    return <LoginForm />;
}
