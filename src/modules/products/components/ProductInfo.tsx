"use client";

import * as React from 'react';
import { Star, ShieldCheck, Truck, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Product } from '@/types/product';
import { QuantitySelector } from './QuantitySelector';
import { useCart } from '@/modules/cart/hooks/useCart';

interface ProductInfoProps {
    product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
    const [quantity, setQuantity] = React.useState(1);
    const [addedToCart, setAddedToCart] = React.useState(false);
    const { addItem, isAdding } = useCart();
    const router = require('next/navigation').useRouter();

    const inStock = product.stock > 0;
    const lowStock = product.stock > 0 && product.stock <= 5;

    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(product.price);

    const comparePrice = product.compareAtPrice
        ? new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
          }).format(product.compareAtPrice)
        : null;

    const discountPct =
        product.compareAtPrice && product.compareAtPrice > product.price
            ? Math.round(
                  ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
              )
            : null;

    const handleAddToCart = () => {
        if (!inStock) return;
        addItem(
            { productId: product.id, quantity },
            {
                onSuccess: () => {
                    toast.success(`${product.name} added to cart!`);
                    setAddedToCart(true);
                    setTimeout(() => setAddedToCart(false), 6000);
                },
                onError: (err: unknown) =>
                    toast.error((err as any)?.message || 'Failed to add to cart'),
            }
        );
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Category */}
            {product.category && (
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {product.category.name}
                </span>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
                {product.name}
            </h1>

            {/* Rating (static) */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                            key={s}
                            className={`w-4 h-4 ${s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                        />
                    ))}
                </div>
                <span className="text-sm text-gray-500">4.8 · 124 reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-gray-900">{formattedPrice}</span>
                {comparePrice && (
                    <span className="text-base text-gray-400 line-through">{comparePrice}</span>
                )}
                {discountPct && (
                    <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        -{discountPct}% OFF
                    </span>
                )}
            </div>

            {/* Short description */}
            {(product.shortDescription || product.description) && (
                <p className="text-base text-gray-600 leading-relaxed">
                    {product.shortDescription || product.description}
                </p>
            )}

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
                <span
                    className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${
                        !inStock
                            ? 'bg-red-50 text-red-600'
                            : lowStock
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-green-50 text-green-600'
                    }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${
                            !inStock ? 'bg-red-500' : lowStock ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                    />
                    {!inStock
                        ? 'Out of Stock'
                        : lowStock
                        ? `Only ${product.stock} left`
                        : 'In Stock'}
                </span>
            </div>

            {/* Quantity + CTA */}
            <div className="flex flex-col gap-4 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Quantity</span>
                    <QuantitySelector
                        quantity={quantity}
                        maxQuantity={inStock ? product.stock : 1}
                        onChange={setQuantity}
                    />
                </div>

                <div className="relative overflow-hidden">
                    <div 
                        className={`flex flex-col gap-3 transition-all duration-300 ease-out ${
                            addedToCart ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
                        }`}
                    >
                        <button
                            onClick={handleAddToCart}
                            disabled={!inStock || isAdding}
                            className="w-full py-4 rounded-2xl bg-black text-white font-semibold text-base tracking-wide transition-all hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                        >
                            {isAdding ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : inStock ? (
                                'Add to Cart'
                            ) : (
                                'Out of Stock'
                            )}
                        </button>
                    </div>

                    {addedToCart && (
                        <div className="absolute inset-0 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full py-4 rounded-2xl bg-violet-600 text-white font-semibold text-base tracking-wide transition-all hover:bg-violet-700 flex items-center justify-center gap-2 shadow-md"
                            >
                                Checkout
                            </button>
                            <button
                                onClick={() => router.push('/products')}
                                className="w-full py-4 rounded-2xl bg-gray-100 text-gray-900 font-semibold text-sm tracking-wide transition-all hover:bg-gray-200 flex items-center justify-center gap-2"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Value props */}
            <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                    { icon: ShieldCheck, label: '1-Year Warranty' },
                    { icon: Truck, label: 'Free Shipping' },
                    { icon: Package, label: 'Easy Returns' },
                ].map(({ icon: Icon, label }) => (
                    <div
                        key={label}
                        className="flex flex-col items-center gap-1.5 text-center p-3 rounded-2xl bg-gray-50"
                    >
                        <Icon className="w-5 h-5 text-gray-500" />
                        <span className="text-xs text-gray-600 font-medium leading-tight">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ProductInfoSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
            <div className="h-9 w-3/4 rounded bg-gray-200 animate-pulse" />
            <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
            <div className="h-9 w-1/3 rounded bg-gray-200 animate-pulse" />
            <div className="h-16 w-full rounded bg-gray-200 animate-pulse" />
            <div className="h-12 w-full rounded-2xl bg-gray-200 animate-pulse" />
        </div>
    );
}
