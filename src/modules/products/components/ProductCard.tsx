"use client";

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

import { useRouter } from 'next/navigation';

export function ProductCard({ product, className, onAddToCart }: ProductCardProps) {
    const router = useRouter();

    const pastelColors = [
        '#dbeafe', // blue-100
        '#dcfce7', // green-100
        '#fee2e2', // red-100
        '#fef9c3', // yellow-100
        '#f3e8ff', // purple-100
        '#fce7f3', // pink-100
        '#e0e7ff', // indigo-100
        '#ffedd5'  // orange-100
    ];

    // Generate a mock rating and color based on ID
    const { rating, pastelColor } = React.useMemo(() => {
        const hash = product.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        return {
            rating: 3.5 + (hash % 15) / 10,
            pastelColor: pastelColors[hash % pastelColors.length]
        };
    }, [product.id]);

    const isMockNew = product.createdAt ? new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false;

    // Formatting currency
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: product.currency || 'USD',
    }).format(product.price);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onAddToCart && product.stock > 0) {
            onAddToCart(product);
        }
    };

    const handleCardClick = () => {
        router.push(`/product/${product.slug}`);
    };

    const [imageError, setImageError] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleCardClick}
            className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm ring-1 ring-border transition-all hover:shadow-md cursor-pointer',
                className
            )}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden">
                {/* Pastel Box Placeholder */}
                <div
                    className="absolute inset-0 z-0"
                    style={{ backgroundColor: pastelColor }}
                />

                {/* Badges */}
                <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-2">
                    {product.stock <= 0 && (
                        <div className="rounded-md bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground shadow-sm">
                            Out of Stock
                        </div>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                        <div className="rounded-md bg-amber-500 px-2 py-1 text-xs font-semibold text-white shadow-sm">
                            Low Stock
                        </div>
                    )}
                    {isMockNew && (
                        <div className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                            New
                        </div>
                    )}
                </div>

                {/* Main Image with Zoom on Hover */}
                {product.images?.length > 0 && !imageError && (
                    <motion.div
                        className="relative h-full w-full z-10"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    >
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            onError={() => setImageError(true)}
                        />
                    </motion.div>
                )}

                {/* Quick Add to Cart Button */}
                <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full px-4 pb-4 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                    <Button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className="w-full rounded-xl py-6 font-semibold shadow-lg"
                        size="lg"
                    >
                        {product.stock > 0 ? (
                            <>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </>
                        ) : (
                            'Out of Stock'
                        )}
                    </Button>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-1 flex-col p-4">
                <div className="mb-1 text-sm text-muted-foreground outline-none hover:text-foreground">
                    {typeof product.category === 'string' ? product.category : product.category?.name ?? ''}
                </div>
                <h3 className="line-clamp-2 text-base font-medium leading-tight text-foreground transition-colors group-hover:text-primary">
                    {product.name}
                </h3>

                <div className="mt-2 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={cn(
                                "h-3.5 w-3.5",
                                star <= Math.round(rating)
                                    ? "fill-primary text-primary"
                                    : "fill-muted text-muted"
                            )}
                        />
                    ))}
                    <span className="ml-1 text-xs text-muted-foreground">({(rating).toFixed(1)})</span>
                </div>

                <div className="mt-auto pt-3">
                    <span className="text-lg font-semibold tracking-tight text-foreground">
                        {formattedPrice}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
            <div className="aspect-[4/5] w-full animate-pulse bg-muted" />
            <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 h-4 w-1/3 animate-pulse rounded bg-muted"></div>
                <div className="mb-1 h-5 w-full animate-pulse rounded bg-muted"></div>
                <div className="mb-3 h-5 w-2/3 animate-pulse rounded bg-muted"></div>
                <div className="mt-auto h-6 w-1/4 animate-pulse rounded bg-muted"></div>
            </div>
        </div>
    );
}
