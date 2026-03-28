'use client';

import Link from 'next/link';
import { Container } from './Container';
import { usePathname } from 'next/navigation';

export function Footer() {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');
    const isAccountRoute = pathname?.startsWith('/account');

    if (isAdminRoute || isAccountRoute) {
        return null;
    }

    return (
        <footer className="bg-black border-t border-[var(--color-border)] py-20">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3
                            className="text-3xl font-extrabold text-[var(--color-text-inverse)] mb-6 tracking-tight uppercase"
                            style={{ fontFamily: "var(--font-heading)" }}
                        >
                            Motovise
                        </h3>
                        <p className="text-lg text-[var(--color-text-muted)] max-w-sm leading-relaxed mb-8">
                            Precision-engineered automotive components for drivers who demand absolute performance. 
                            Built for the track, refined for the street.
                        </p>
                        <div className="flex gap-4">
                            {['f', 't', 'ig'].map(icon => (
                                <div key={icon} className="w-10 h-10 rounded-full bg-[var(--color-surface-strong)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-inverse)] text-sm font-bold cursor-pointer hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all">
                                    {icon}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-6">
                            Shop
                        </h4>
                        <ul className="space-y-4 text-[var(--color-text-muted)]">
                            <li>
                                <Link href="/products" className="hover:text-[var(--color-text-inverse)] transition-colors">
                                    All Components
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?sort=newest" className="hover:text-[var(--color-text-inverse)] transition-colors">
                                    New Arrivals
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?sort=rating-desc" className="hover:text-[var(--color-text-inverse)] transition-colors">
                                    Performance Series
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-6">
                            Support
                        </h4>
                        <ul className="space-y-4 text-[var(--color-text-muted)]">
                            <li>
                                <Link href="/account" className="hover:text-[var(--color-text-inverse)] transition-colors">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <span className="hover:text-[var(--color-text-inverse)] transition-colors cursor-pointer">
                                    Shipping & Logistics
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-[var(--color-text-inverse)] transition-colors cursor-pointer">
                                    Warranty & Returns
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-[var(--color-text-inverse)] transition-colors cursor-pointer">
                                    Privacy Protocol
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-[var(--color-text-muted)]">
                        © {new Date().getFullYear()} Motovise. Engineered for excellence.
                    </p>
                    <div className="flex gap-8 text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
                        <span>ISO 9001 Certified</span>
                        <span>Global Shipping</span>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
