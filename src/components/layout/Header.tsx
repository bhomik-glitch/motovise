'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
            <div className="font-semibold text-slate-800 text-lg">
                Admin Portal
            </div>

            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <User className="w-4 h-4 text-slate-500" />
                    </div>
                    {user && (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700 leading-none">{user.email}</span>
                            <span className="text-xs text-slate-500 mt-1 capitalize">{user.role.toLowerCase()}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => logout()}
                    className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors bg-slate-50 hover:bg-red-50 px-3 py-2 rounded-md border border-slate-200 hover:border-red-200"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
}
