import React from 'react';
import { SectionSkeleton } from '@/components/ui/PageSkeleton';

export function CartSkeleton() {
    return (
        <div className="bg-white px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="h-10 bg-gray-100 rounded w-48 mb-12 animate-pulse"></div>
            <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                <section aria-labelledby="cart-heading" className="lg:col-span-7">
                    <div className="flex flex-col gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-4 border-b border-gray-100 pb-6">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                                <div className="flex-1 flex flex-col gap-3 py-2">
                                    <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                                    <div className="mt-auto h-8 bg-gray-100 rounded w-28 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <div className="mt-16 lg:col-span-5 lg:mt-0">
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 flex flex-col gap-4">
                        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse mt-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-12 bg-gray-200 rounded w-full mt-6 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
