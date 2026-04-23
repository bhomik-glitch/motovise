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
    const [direction, setDirection] = React.useState<'left' | 'right'>('right');
    const [animating, setAnimating] = React.useState(false);
    const [errored, setErrored] = React.useState<Set<number>>(new Set());
    const thumbsRef = React.useRef<HTMLDivElement>(null);

    const safeImages = images?.length ? images : ['/placeholder.png'];

    const markError = (i: number) =>
        setErrored((prev) => { const n = new Set(prev); n.add(i); return n; });

    const src = (i: number) =>
        errored.has(i) || !safeImages[i] ? '/placeholder.png' : safeImages[i];

    const goTo = (index: number, dir: 'left' | 'right') => {
        if (animating || index === active) return;
        setDirection(dir);
        setAnimating(true);
        setTimeout(() => {
            setActive(index);
            setAnimating(false);
        }, 260);
    };

    const prev = () => goTo(active === 0 ? safeImages.length - 1 : active - 1, 'left');
    const next = () => goTo((active + 1) % safeImages.length, 'right');

    // Scroll active thumb into view
    React.useEffect(() => {
        const el = thumbsRef.current?.children[active] as HTMLElement | undefined;
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, [active]);

    // Keyboard navigation
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    });

    // Touch swipe
    const touchStartX = React.useRef<number>(0);
    const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const onTouchEnd = (e: React.TouchEvent) => {
        const dx = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 40) dx > 0 ? next() : prev();
    };

    const slideStyle: React.CSSProperties = animating
        ? {
            opacity: 0,
            transform: `translateX(${direction === 'right' ? '-32px' : '32px'})`,
            transition: 'opacity 0.26s ease, transform 0.26s ease',
          }
        : {
            opacity: 1,
            transform: 'translateX(0)',
            transition: 'opacity 0.26s ease, transform 0.26s ease',
          };

    return (
        <div className="flex flex-col gap-4 w-full select-none">
            {/* ── Main image ── */}
            <div
                className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <div className="absolute inset-0" style={slideStyle}>
                    <Image
                        key={active}
                        src={src(active)}
                        alt={`${productName} — view ${active + 1}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 55vw"
                        priority
                        onError={() => markError(active)}
                    />
                </div>

                {/* Prev / Next arrows */}
                {safeImages.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 shadow-md hover:bg-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-150"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-800" />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 shadow-md hover:bg-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-150"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-800" />
                        </button>

                        {/* Dot indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {safeImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i, i > active ? 'right' : 'left')}
                                    className={cn(
                                        'rounded-full transition-all duration-200',
                                        i === active
                                            ? 'w-5 h-1.5 bg-gray-900'
                                            : 'w-1.5 h-1.5 bg-gray-400 hover:bg-gray-600'
                                    )}
                                    aria-label={`Go to image ${i + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ── Horizontal thumbnail strip ── */}
            {safeImages.length > 1 && (
                <div
                    ref={thumbsRef}
                    className="flex gap-2.5 overflow-x-auto pb-1 scroll-smooth"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {safeImages.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i, i > active ? 'right' : 'left')}
                            className={cn(
                                'relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-200 ring-2 ring-offset-2',
                                i === active
                                    ? 'ring-gray-900 opacity-100 scale-105'
                                    : 'ring-transparent opacity-50 hover:opacity-80 hover:scale-102'
                            )}
                            aria-label={`View image ${i + 1}`}
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
        </div>
    );
}

export function ProductGallerySkeleton() {
    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="w-full aspect-square rounded-2xl bg-gray-200 animate-pulse" />
            <div className="flex gap-2.5">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
                ))}
            </div>
        </div>
    );
}
