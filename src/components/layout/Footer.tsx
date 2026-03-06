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
        <footer className="bg-[#EEF2FF] border-t border-[#E2E8F0] py-14">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3
                            className="text-xl font-bold text-[#0F172A] mb-3 tracking-tight"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Motovise
                        </h3>
                        <p className="text-sm text-[#64748B] max-w-xs leading-relaxed">
                            Precision-engineered automotive parts for drivers who demand more.
                            Built for performance, built to last.
                        </p>
                        <div className="mt-4 flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#7C9CF5]/20 flex items-center justify-center text-[#7C9CF5] text-xs font-bold cursor-pointer hover:bg-[#7C9CF5] hover:text-white transition-colors">
                                f
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-[#7C9CF5]/20 flex items-center justify-center text-[#7C9CF5] text-xs font-bold cursor-pointer hover:bg-[#7C9CF5] hover:text-white transition-colors">
                                t
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-[#7C9CF5]/20 flex items-center justify-center text-[#7C9CF5] text-xs font-bold cursor-pointer hover:bg-[#7C9CF5] hover:text-white transition-colors">
                                ig
                            </div>
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-[#0F172A] mb-4">
                            Shop
                        </h4>
                        <ul className="space-y-2.5 text-sm text-[#64748B]">
                            <li>
                                <Link href="/products" className="hover:text-[#7C9CF5] transition-colors">
                                    All Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?sort=newest" className="hover:text-[#7C9CF5] transition-colors">
                                    New Arrivals
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?sort=rating-desc" className="hover:text-[#7C9CF5] transition-colors">
                                    Best Sellers
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-[#0F172A] mb-4">
                            Support
                        </h4>
                        <ul className="space-y-2.5 text-sm text-[#64748B]">
                            <li>
                                <Link href="/account" className="hover:text-[#7C9CF5] transition-colors">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <span className="hover:text-[#7C9CF5] transition-colors cursor-pointer">
                                    Shipping Policy
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-[#7C9CF5] transition-colors cursor-pointer">
                                    Returns &amp; Refunds
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-[#7C9CF5] transition-colors cursor-pointer">
                                    Privacy Policy
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-[#64748B]">
                        © {new Date().getFullYear()} Motovise. All rights reserved.
                    </p>
                    <p className="text-xs text-[#64748B]">
                        Precision Engineered · Built for Drivers
                    </p>
                </div>
            </Container>
        </footer>
    );
}
