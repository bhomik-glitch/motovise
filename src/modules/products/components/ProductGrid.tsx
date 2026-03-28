import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProductGridProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Responsive Product Grid
 * Mobile: 1 column
 * Tablet: 2 columns
 * Desktop: 3 columns
 * Large Desktop: 4 columns
 * Uses a consistent 4px spacing scale (gap-4 = 16px, gap-6 = 24px)
 */
export function ProductGrid({ children, className }: ProductGridProps) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-8",
                className
            )}
        >
            {children}
        </div>
    );
}
