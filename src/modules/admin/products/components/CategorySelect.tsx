'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import { ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategorySelectProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    className?: string;
}

export function CategorySelect({ value, onChange, error, className }: CategorySelectProps) {
    const { data: categories, isLoading } = useCategories();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCategories = categories?.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const selectedCategory = categories?.find((cat) => cat.id === value);

    return (
        <div className={cn('relative', className)} ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
            </label>
            <div
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex items-center justify-between w-full px-3 py-2 border rounded-md shadow-sm bg-white cursor-pointer hover:bg-gray-50',
                    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black',
                    !selectedCategory && 'text-gray-500'
                )}
            >
                <span>
                    {isLoading ? 'Loading categories...' : selectedCategory ? selectedCategory.name : 'Select a category'}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
            </div>

            {open && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 flex flex-col">
                    <div className="p-2 border-b flex items-center shrink-0">
                        <Search size={16} className="text-gray-400 mr-2" />
                        <input
                            autoFocus
                            className="w-full text-sm outline-none placeholder:text-gray-400"
                            placeholder="Search category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="overflow-y-auto w-full p-1">
                        {filteredCategories.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500 text-center">No category found</div>
                        ) : (
                            filteredCategories.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() => {
                                        onChange(cat.id);
                                        setOpen(false);
                                        setSearch('');
                                    }}
                                    className={cn(
                                        'px-2 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md flex items-center justify-between',
                                        value === cat.id ? 'bg-gray-50 font-medium text-black' : 'text-gray-700'
                                    )}
                                >
                                    {cat.name}
                                    {value === cat.id && <Check size={16} />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}
