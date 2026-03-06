'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Menu } from 'lucide-react';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="font-semibold text-slate-800 text-lg">
                    Admin Portal
                </div>
            </div>

            <div className="flex items-center space-x-3 md:space-x-6">
                <div className="flex items-center space-x-2 text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <User className="w-4 h-4 text-slate-500" />
                    </div>
                    {user && (
                        <div className="hidden sm:flex flex-col">
                            <span className="text-sm font-medium text-slate-700 leading-none">{user.email}</span>
                            <span className="text-xs text-slate-500 mt-1 capitalize">{user.role.toLowerCase()}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => logout()}
                    className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors bg-slate-50 hover:bg-red-50 p-2 md:px-3 md:py-2 rounded-md border border-slate-200 hover:border-red-200"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}
