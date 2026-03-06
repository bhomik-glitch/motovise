import React from 'react';
import { motion } from 'framer-motion';

export function PageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 sm:py-12 animate-pulse">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar skeleton, visible on desktop, tab-like on mobile might look different but this covers base layout */}
                <div className="w-full md:w-64 space-y-4">
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                </div>
                <div className="flex-1 space-y-6">
                    <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
                </div>
            </div>
        </div>
    );
}

export function SectionSkeleton({ className }: { className?: string }) {
    return (
        <div className={`space-y-4 animate-pulse ${className || ''}`}>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
        </div>
    );
}
