'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { adminRoutes } from '@/config/adminRoutes';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { hasPermission } = useAuth();
    const pathname = usePathname();

    // Pure conditional rendering: only render routes if permission exists
    const visibleRoutes = adminRoutes.filter(route => hasPermission(route.permission));

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-50 w-[260px] flex-shrink-0 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 transition-transform duration-300 md:static md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 font-bold text-white text-lg tracking-wide">
                <span>Admin Panel</span>
                <button
                    onClick={onClose}
                    className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
                    aria-label="Close sidebar"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {visibleRoutes.map((route) => {
                    const isActive = pathname === route.path || pathname.startsWith(`${route.path}/`);
                    const Icon = route.icon;
                    return (
                        <Link
                            key={route.path}
                            href={route.path}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            <span className="font-medium text-sm">{route.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
                Secure Environment
            </div>
        </aside>
    );
}
