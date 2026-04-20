'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function ForbiddenPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 w-full">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
                <ShieldAlert className="w-10 h-10 text-red-500" strokeWidth={1.5} />
            </div>

            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Access Denied</h1>
            <p className="text-lg text-slate-600 max-w-md mb-8">
                You do not have permission to access this resource.
            </p>

            <Link
                href="/admin/dashboard"
                className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
                Return to Dashboard
            </Link>
        </div>
    );
}
