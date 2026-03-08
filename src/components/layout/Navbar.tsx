'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, User, Command, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import LogoImg from '@/assets/logo-removebg-preview.png';

import { useCart } from '@/modules/cart/hooks/useCart';

export function Navbar() {
    const { cart } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [distanceToCenter, setDistanceToCenter] = useState(0);
    const navPillRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();

    const { scrollY } = useScroll();
    const progressToCenter = useTransform(scrollY, (currentScrollY) => {
        const documentHeight = document.documentElement.scrollHeight;
        if (documentHeight <= 0) {
            return 0;
        }

        const scrollProgress = currentScrollY / (documentHeight * 0.2);
        return Math.min(scrollProgress, 1);
    });
    const smoothProgress = useSpring(progressToCenter, {
        stiffness: 120,
        damping: 20,
    });
    const desktopX = useTransform(smoothProgress, (progress) => progress * distanceToCenter);

    useEffect(() => {
        const updateDistanceToCenter = () => {
            const navWidth = navPillRef.current?.offsetWidth ?? 0;
            const startX = 24;
            const centerX = window.innerWidth / 2 - navWidth / 2;
            setDistanceToCenter(Math.max(centerX - startX, 0));
        };

        updateDistanceToCenter();

        const resizeObserver = new ResizeObserver(() => {
            updateDistanceToCenter();
        });

        if (navPillRef.current) {
            resizeObserver.observe(navPillRef.current);
        }

        window.addEventListener('resize', updateDistanceToCenter, { passive: true });

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateDistanceToCenter);
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
            'fixed left-0 right-0 z-50 transition-all duration-300',
            'top-0 px-0 md:top-6 md:px-6'
        )}>
            <div className={cn(
                'max-w-7xl mx-auto flex items-center h-16 relative transition-all duration-300 px-4 md:px-0',
                'bg-black border-b border-neutral-800 md:bg-transparent md:border-none'
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

                {/* Desktop floating pill: left -> center based on scroll */}
                <motion.div
                    ref={navPillRef}
                    style={{ x: desktopX, willChange: 'transform' }}
                    className="hidden md:flex items-center z-30 fixed top-6 left-6"
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
                </motion.div>

                {/* Mobile actions pill */}
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

                {/* Mobile Trigger */}
                <button
                    onClick={() => setMobileOpen((v) => !v)}
                    className="md:hidden z-30 p-2 text-white rounded-full bg-black ml-4"
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
