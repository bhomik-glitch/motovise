"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FilterState {
    categories: string[];
    minPrice?: number;
    maxPrice?: number;
}

interface FilterSidebarProps {
    availableCategories: string[];
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    className?: string;
}

export function FilterSidebar({ availableCategories, filters, onChange, className }: FilterSidebarProps) {

    const handleCategoryChange = (category: string) => {
        const newCategories = filters.categories.includes(category)
            ? filters.categories.filter((c) => c !== category)
            : [...filters.categories, category];

        onChange({ ...filters, categories: newCategories });
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'minPrice' | 'maxPrice') => {
        const value = e.target.value ? Number(e.target.value) : undefined;
        onChange({ ...filters, [field]: value });
    };

    return (
        <aside className={cn("flex flex-col gap-8", className)}>
            {/* Categories */}
            <div>
                <h3 className="mb-4 text-sm font-semibold tracking-tight text-foreground uppercase">Categories</h3>
                <div className="flex flex-col gap-3">
                    {availableCategories.map((category) => (
                        <label
                            key={category}
                            className="flex cursor-pointer items-center space-x-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <div className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={filters.categories.includes(category)}
                                    onChange={() => handleCategoryChange(category)}
                                    aria-label={`Filter by ${category}`}
                                />
                                {filters.categories.includes(category) && (
                                    <svg
                                        className="h-3 w-3 fill-primary"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                                    </svg>
                                )}
                            </div>
                            <span>{category}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="mb-4 text-sm font-semibold tracking-tight text-foreground uppercase">Price Range</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={filters.minPrice || ''}
                        onChange={(e) => handlePriceChange(e, 'minPrice')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Minimum price"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handlePriceChange(e, 'maxPrice')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Maximum price"
                    />
                </div>
            </div>

        </aside>
    );
}

export function FilterSidebarSkeleton() {
    return (
        <div className="flex flex-col gap-8 w-full">
            <div>
                <div className="mb-4 h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="flex flex-col gap-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-4 w-4 animate-pulse rounded-sm bg-muted" />
                            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <div className="mb-4 h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="flex items-center gap-2">
                    <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                    <span className="text-muted-foreground">-</span>
                    <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                </div>
            </div>
        </div>
    );
}
