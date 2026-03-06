"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating-desc';

interface SortDropdownProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
    className?: string;
}

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
    return (
        <div className={cn("relative inline-flex", className)}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as SortOption)}
                className="h-10 appearance-none items-center justify-between rounded-md border border-input bg-background px-4 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Sort products"
            >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Top Rated</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="h-4 w-4 opacity-50" />
            </span>
        </div>
    );
}
