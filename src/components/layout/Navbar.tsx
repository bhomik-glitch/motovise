'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ShoppingBag, User, Command, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LogoImg from '@/assets/logo-removebg-preview.png';

import { useCart } from '@/modules/cart/hooks/useCart';

export function Navbar() {
    const { cart } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const isAdminRoute = pathname?.startsWith('/admin');
    const isAccountRoute = pathname?.startsWith('/account');

    if (isAdminRoute) {
        return null;
    }

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Products' },
    ];

    const cartCount = cart?.itemCount || 0;

    const actions = [
        { href: '/cart', icon: ShoppingBag, label: 'Cart', badge: cartCount > 0 ? cartCount : null },
        { href: '/account', icon: User, label: 'Profile' },
    ];

    return (
        <nav className={cn(
            "fixed left-0 right-0 z-50 transition-all duration-300",
            "top-0 px-0 md:top-6 md:px-6"
        )}>
            <div className={cn(
                "max-w-7xl mx-auto flex items-center h-16 relative transition-all duration-300 px-4 md:px-0",
                "bg-black/95 backdrop-blur-xl border-b border-white/10 md:bg-transparent md:border-none"
            )}>

                {/* LOGO: Left locked */}
                <div className="relative md:absolute md:left-0 z-20 flex items-center">
                    <Link href="/" className="group flex items-center">
                        <div className="relative w-16 h-16 md:w-24 md:h-24 overflow-hidden">
                            <Image
                                src={LogoImg}
                                alt="Motovise Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </Link>
                </div>

                {/* NAVIGATION PILL: Right at top, Center on scroll */}
                <div className="flex-1 flex h-full items-center justify-end md:justify-start relative">
                    <motion.div
                        animate={{
                            left: scrolled ? '50%' : '100%',
                            x: scrolled ? '-50%' : '-100%',
                        }}
                        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                        className={cn(
                            "flex items-center z-10",
                            "relative md:absolute",
                            "!left-auto !translate-x-0 md:!left-full md:!translate-x-[-100%]" // CSS override to keep icons visible on mobile bar
                        )}
                    >
                        <div className="flex items-center bg-black/85 backdrop-blur-xl border border-white/10 rounded-full p-1.5 gap-1 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "px-6 py-2 text-[13px] font-bold rounded-full transition-all duration-300 hidden md:block",
                                            isActive
                                                ? "bg-white text-black shadow-lg shadow-white/10"
                                                : "text-white hover:text-white/80"
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}

                            <div className="w-px h-4 bg-white/20 mx-2 hidden md:block" />

                            {actions.map((action) => (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="p-2 text-white hover:bg-white/10 rounded-full transition-all relative"
                                    title={action.label}
                                >
                                    <action.icon className="h-4.5 w-4.5" />
                                    {action.badge && (
                                        <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-black/10">
                                            {action.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}

                            <div className="hidden md:flex items-center justify-center h-8 w-8 rounded-full border border-white/10 bg-white/5 text-white/50 ml-1">
                                <Command className="h-3.5 w-3.5" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Mobile Trigger */}
                <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="md:hidden z-30 p-2 text-white rounded-full bg-black/50 backdrop-blur-sm ml-4"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="md:hidden mt-4 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl overflow-hidden"
                    >
                        <div className="flex flex-col gap-3">
                            {[...navLinks, ...actions].map((link) => {
                                const Icon = 'icon' in link ? (link.icon as any) : null;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            "px-5 py-3.5 text-base font-bold rounded-2xl transition-all flex items-center justify-between",
                                            pathname === link.href ? "bg-white text-black" : "text-white/80 hover:bg-white/10"
                                        )}
                                    >
                                        <span>{link.label}</span>
                                        {Icon && <Icon className="h-5 w-5 opacity-60" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
