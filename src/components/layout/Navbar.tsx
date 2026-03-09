'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ShoppingBag, User, Command, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LogoImg from '@/assets/logo-removebg-preview.png';

import { useCart } from '@/modules/cart/hooks/useCart';

export function Navbar() {
    const { cart } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const navPillRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const navEl = navPillRef.current;
        if (!navEl) {
            return;
        }

        let rafId = 0;
        let targetX = 0;
        let currentX = 0;
        let distanceToCenter = 0;

        const updateDistanceToCenter = () => {
            const rightOffset = 24;
            const centerX = window.innerWidth / 2 - navEl.offsetWidth / 2;
            const startX = window.innerWidth - rightOffset - navEl.offsetWidth;
            distanceToCenter = Math.max(startX - centerX, 0);
        };

        const updateTargetFromScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight <= 0) {
                targetX = 0;
                return;
            }

            const progress = Math.min(window.scrollY / (scrollHeight * 0.2), 1);
            targetX = -progress * distanceToCenter;
        };

        const animate = () => {
            // Spring-like smoothing without React re-renders.
            currentX += (targetX - currentX) * 0.14;

            if (Math.abs(targetX - currentX) < 0.1) {
                currentX = targetX;
            }

            navEl.style.transform = `translate3d(${currentX}px, 0, 0)`;
            rafId = window.requestAnimationFrame(animate);
        };

        const onScroll = () => {
            updateTargetFromScroll();
        };

        const onResize = () => {
            updateDistanceToCenter();
            updateTargetFromScroll();
        };

        navEl.style.willChange = 'transform';
        updateDistanceToCenter();
        updateTargetFromScroll();

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });

        const resizeObserver = new ResizeObserver(() => {
            onResize();
        });
        resizeObserver.observe(navEl);

        rafId = window.requestAnimationFrame(animate);

        return () => {
            window.cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            resizeObserver.disconnect();
        };
    }, []);

    const isAdminRoute = pathname?.startsWith('/admin');

    if (isAdminRoute) {
        return null;
    }

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Products' },
    ];

    const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    const actions = [
        { href: '/cart', icon: ShoppingBag, label: 'Cart', badge: cartCount > 0 ? cartCount : null },
        { href: '/account', icon: User, label: 'Profile' },
    ];

    return (
        <nav className={cn(
            'fixed left-0 right-0 top-0 z-50 border-b border-neutral-800 bg-black/90 backdrop-blur-md transition-all duration-300',
            'px-0 md:top-6 md:px-6 md:border-none md:bg-transparent md:backdrop-blur-0'
        )}>
            <div className={cn(
                'max-w-7xl mx-auto flex items-center h-16 relative transition-all duration-300 px-4 md:px-0',
                'bg-black border-b border-neutral-800 md:bg-transparent md:border-none'
            )}>
                <div className="relative md:absolute md:left-0 z-20 flex items-center">
                    <Link href="/" className="group flex items-center">
                        <div className="relative w-16 h-16 md:w-24 md:h-24 overflow-hidden">
                            <Image src={LogoImg} alt="Motovise Logo" fill className="object-contain" />
                        </div>
                    </Link>
                </div>

                <div
                    ref={navPillRef}
                    className="hidden md:flex items-center z-30 fixed top-6 right-6"
                >
                    <div className="flex items-center bg-black border border-neutral-800 rounded-full p-1.5 gap-1 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'px-6 py-2 text-[13px] font-bold rounded-full transition-all duration-300',
                                        isActive
                                            ? 'bg-white text-black shadow-lg shadow-white/10'
                                            : 'text-white hover:text-white/80'
                                    )}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}

                        <div className="w-px h-4 bg-white/20 mx-2" />

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

                        <div className="flex items-center justify-center h-8 w-8 rounded-full border border-white/10 bg-white/5 text-white/50 ml-1">
                            <Command className="h-3.5 w-3.5" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex h-full items-center justify-end md:hidden relative">
                    <div className="flex items-center bg-black border border-neutral-800 rounded-full p-1.5 gap-1 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
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
                    </div>
                </div>

                <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="md:hidden z-30 p-2 text-white rounded-full bg-black ml-4"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="md:hidden mt-4 bg-black border border-neutral-800 rounded-3xl p-5 shadow-2xl overflow-hidden"
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
                                            'px-5 py-3.5 text-base font-bold rounded-2xl transition-all flex items-center justify-between',
                                            pathname === link.href ? 'bg-white text-black' : 'text-white/80 hover:bg-white/10'
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

