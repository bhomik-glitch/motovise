"use client";

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [active, setActive] = React.useState(0);
    const [errored, setErrored] = React.useState<Set<number>>(new Set());

    const safeImages = images?.length ? images : ['/placeholder.png'];

    const markError = (i: number) =>
        setErrored((prev) => { const n = new Set(prev); n.add(i); return n; });

    const prev = () => setActive((a) => (a === 0 ? safeImages.length - 1 : a - 1));
    const next = () => setActive((a) => (a + 1) % safeImages.length);

    const src = (i: number) =>
        errored.has(i) || !safeImages[i] ? '/placeholder.png' : safeImages[i];

    return (
        <div className="flex gap-4 w-full">
            {/* Vertical thumbnail strip */}
            {safeImages.length > 1 && (
                <div className="flex flex-col gap-3 shrink-0">
                    {safeImages.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={cn(
                                'relative w-16 h-16 rounded-xl overflow-hidden ring-2 ring-offset-2 ring-offset-background transition-all',
                                active === i
                                    ? 'ring-black opacity-100'
                                    : 'ring-transparent opacity-50 hover:opacity-80'
                            )}
                        >
                            <Image
                                src={src(i)}
                                alt={`${productName} thumbnail ${i + 1}`}
                                fill
                                className="object-cover"
                                onError={() => markError(i)}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Main image */}
            <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-gray-50 group">
                <Image
                    key={active}
                    src={src(active)}
                    alt={`${productName} - view ${active + 1}`}
                    fill
                    className="object-contain transition-opacity duration-300"
                    sizes="(max-width: 768px) 100vw, 55vw"
                    priority
                    onError={() => markError(active)}
                />

                {safeImages.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export function ProductGallerySkeleton() {
    return (
        <div className="flex gap-4 w-full">
            <div className="flex flex-col gap-3 shrink-0">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse" />
                ))}
            </div>
            <div className="flex-1 aspect-square rounded-2xl bg-gray-200 animate-pulse" />
        </div>
    );
}
