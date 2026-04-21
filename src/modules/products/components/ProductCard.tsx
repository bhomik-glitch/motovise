"use client";

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Cpu, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import { useRouter } from 'next/navigation';

export interface ProductCardProps {
    product: Product;
    className?: string;
    onAddToCart?: (product: Product) => void;
    isLoading?: boolean;
}

/** Determine if the product belongs to the Android Box category */
function isAndroidBox(product: Product): boolean {
    const catSlug = product.category?.slug ?? '';
    const catName = (product.category?.name ?? '').toLowerCase();
    return catSlug === 'android-box' || catName.includes('android box');
}

function isWirelessAdapter(product: Product): boolean {
    const catSlug = product.category?.slug ?? '';
    const catName = (product.category?.name ?? '').toLowerCase();
    return catSlug === 'wireless-adapter' || catName.includes('wireless adapter');
}

function CategoryBadge({ product }: { product: Product }) {
    if (isAndroidBox(product)) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-600/90 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                <Cpu className="h-3 w-3" />
                Android Box
            </span>
        );
    }
    if (isWirelessAdapter(product)) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-600/90 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                <Wifi className="h-3 w-3" />
                Wireless Adapter
            </span>
        );
    }
    if (product.category?.name) {
        return (
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {product.category.name}
            </span>
        );
    }
    return null;
}

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace('/v1', '');

function resolveImageUrl(path: string | null | undefined): string {
    if (!path) return '/placeholder-product.png';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
}

export function ProductCard({ product, className, onAddToCart, isLoading }: ProductCardProps) {
    const router = useRouter();
    const [imageError, setImageError] = React.useState(false);
    console.log(product);

    const formattedPrice = product.isComingSoon 
        ? "Coming Soon"
        : new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(product.price);

    const formattedCompareAtPrice = product.compareAtPrice
        ? new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
          }).format(product.compareAtPrice)
        : null;

    const discountPercent =
        product.compareAtPrice && product.compareAtPrice > product.price
            ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
            : null;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAddToCart && product.stock > 0) {
            onAddToCart(product);
        }
    };

    const handleCardClick = () => {
        console.log("Product slug:", product.slug);
        router.push(`/product/${product.slug}`);
    };

    const rawPath = !imageError
        ? (product.thumbnail || product.images?.[0] || null)
        : null;
    const imgSrc = resolveImageUrl(rawPath);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleCardClick}
            className={cn(
                'group relative flex flex-col w-full min-w-0 overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm ring-1 ring-border transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
                className
            )}
        >
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
                {/* Badges — top-left */}
                <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                    {product.isComingSoon && (
                        <div className="rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] tracking-widest font-bold text-white shadow-sm ring-1 ring-white/20">
                            COMING SOON
                        </div>
                    )}
                    {product.stock <= 0 && !product.isComingSoon && (
                        <div className="rounded-md bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground shadow-sm">
                            Out of Stock
                        </div>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                        <div className="rounded-md bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                            Only {product.stock} left
                        </div>
                    )}
                    {discountPercent && (
                        <div className="rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                            -{discountPercent}%
                        </div>
                    )}
                </div>

                {/* Main Image */}
                <motion.div
                    className="relative h-full w-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                    <img
                        src={imgSrc}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        onError={() => setImageError(true)}
                    />
                </motion.div>

                {/* Quick Add to Cart Button */}
                <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full px-3 pb-3 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                    <Button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0 || isLoading}
                        className="w-full rounded-xl py-5 font-semibold shadow-lg"
                        size="lg"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : product.isComingSoon ? (
                            'Unavailable'
                        ) : product.stock > 0 ? (
                            <>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                            </>
                        ) : (
                            'Out of Stock'
                        )}
                    </Button>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-1 flex-col p-4 gap-2">
                {/* Category badge */}
                <CategoryBadge product={product} />

                {/* Product Name */}
                <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {product.name}
                </h3>

                {/* Short description */}
                {product.shortDescription && (
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {product.shortDescription}
                    </p>
                )}

                {/* Price row */}
                <div className="mt-auto pt-2 flex items-baseline gap-2">
                    <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-accent)' }}>
                        {formattedPrice}
                    </span>
                    {formattedCompareAtPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                            {formattedCompareAtPrice}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
            <div className="aspect-square w-full animate-pulse bg-muted" />
            <div className="flex flex-1 flex-col p-4 gap-2">
                <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="mt-auto h-6 w-1/3 animate-pulse rounded bg-muted" />
            </div>
        </div>
    );
}
