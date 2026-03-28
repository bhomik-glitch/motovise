'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginForm() {
    const router = useRouter();
    const { login, isAuthenticated, isBootstrapped } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1️⃣ Redirect If Already Authenticated
    useEffect(() => {
        if (isBootstrapped && isAuthenticated) {
            router.replace('/admin/dashboard');
        }
    }, [isBootstrapped, isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 4️⃣ Prevent Double Submission
        if (isSubmitting) return;

        // 2️⃣ Clear Previous Error Before New Attempt
        setError(null);
        setIsSubmitting(true);

        try {
            await login({ email, password });
            router.replace('/admin/dashboard');
        } catch (err: any) {
            // 5️⃣ Handle Network Failure Explicitly
            if (!err || !err.response) {
                setError("Unable to connect. Please try again.");
                return;
            }

            // 3️⃣ Defensive Error Extraction
            const status = err?.response?.status ?? err?.status ?? 500;

            if (status === 401) {
                setError("Invalid email or password.");
            } else if (status === 429) {
                setError("Too many attempts. Please try again later.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            // 6️⃣ Ensure Button Always Re-enables
            setIsSubmitting(false);
        }
    };

    // Prevent UI flicker during bootstrap
    if (!isBootstrapped) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f4f4f5' }}>
                <p style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>Verifying session...</p>
            </div>
        );
    }

    // Do not show form if redirecting
    if (isAuthenticated) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f4f4f5' }}>
                <p style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>Redirecting...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f4f4f5', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ background: '#fff', padding: '2.5rem 2rem', borderRadius: '10px', border: '1px solid #e4e4e7', minWidth: '340px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center', color: '#111827' }}>
                    Admin Sign In
                </h1>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center', border: '1px solid #fecaca' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                            style={{
                                backgroundColor: '#ffffff',
                                color: '#111827',
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s'
                            }}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                            style={{
                                backgroundColor: '#ffffff',
                                color: '#111827',
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            marginTop: '0.75rem',
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: isSubmitting ? '#9ca3af' : '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
