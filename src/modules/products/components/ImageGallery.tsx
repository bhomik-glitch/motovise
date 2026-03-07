"use client";

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageGalleryProps {
    images: string[];
    productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isZoomed, setIsZoomed] = React.useState(false);
    const [zoomPos, setZoomPos] = React.useState({ x: 50, y: 50 });
    const [erroredImages, setErroredImages] = React.useState<Set<number>>(new Set());

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsZoomed(false);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        setIsZoomed(false);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    const handleImageError = (index: number) => {
        setErroredImages(prev => {
            const next = new Set(prev);
            next.add(index);
            return next;
        });
    };

    if (!images || images.length === 0) {
        return (
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-muted ring-1 ring-border">
                <Image
                    src="/images/product-placeholder.png"
                    alt="Product placeholder"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
            </div>
        );
    }

    const isCurrentErrored = erroredImages.has(currentIndex);

    return (
        <div className="flex flex-col gap-4 w-full max-w-full">
            {/* Main Display */}
            <div className="relative aspect-square w-full max-w-full overflow-hidden rounded-xl bg-muted ring-1 ring-border group max-h-[70vh]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 cursor-crosshair"
                        onMouseMove={handleMouseMove}
                        onClick={() => !isCurrentErrored && setIsZoomed(!isZoomed)}
                        onMouseLeave={() => setIsZoomed(false)}
                    >
                        <Image
                            src={(!isCurrentErrored && images[currentIndex]) ? images[currentIndex] : "/images/product-placeholder.png"}
                            alt={`${productName} - Image ${currentIndex + 1}`}
                            fill
                            className={cn(
                                "object-contain object-center transition-transform duration-200",
                                isZoomed ? "scale-[2]" : "scale-100"
                            )}
                            style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                            sizes="(max-width: 768px) 100vw, 600px"
                            priority
                            onError={() => handleImageError(currentIndex)}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Zoom Hint Overlay */}
                {!isZoomed && !isCurrentErrored && (
                    <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-background/80 p-2 text-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                        <ZoomIn className="h-5 w-5" />
                    </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full opacity-0 shadow-md transition-all group-hover:opacity-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrev();
                            }}
                            aria-label="Previous Image"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full opacity-0 shadow-md transition-all group-hover:opacity-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                            aria-label="Next Image"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </>
                )}
            </div>

            {/* Thumbnails Slider */}
            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory">
                    {images.map((img, idx) => {
                        const isErrored = erroredImages.has(idx);
                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    setIsZoomed(false);
                                }}
                                className={cn(
                                    "relative aspect-square w-16 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted ring-2 ring-offset-2 ring-offset-background transition-all hover:opacity-100 snap-center",
                                    currentIndex === idx ? "ring-primary opacity-100" : "ring-transparent opacity-60"
                                )}
                            >
                                <Image
                                    src={(!isErrored && img) ? img : "/images/product-placeholder.png"}
                                    alt={`${productName} thumbnail ${idx + 1}`}
                                    fill
                                    className="object-cover object-center"
                                    onError={() => handleImageError(idx)}
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function ImageGallerySkeleton() {
    return (
        <div className="flex flex-col gap-4 w-full max-w-full">
            <div className="aspect-square w-full max-w-full animate-pulse rounded-xl bg-muted ring-1 ring-border max-h-[70vh]" />
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="aspect-square w-16 sm:w-20 flex-shrink-0 animate-pulse rounded-xl bg-muted" />
                ))}
            </div>
        </div>
    );
}

