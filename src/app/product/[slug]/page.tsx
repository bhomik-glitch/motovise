"use client";

import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck } from 'lucide-react';
import { useProduct } from '@/modules/products/hooks/useProduct';
import { ImageGallery, ImageGallerySkeleton } from '@/modules/products/components/ImageGallery';
import { QuantitySelector } from '@/modules/products/components/QuantitySelector';
import { ProductTabs } from '@/modules/products/components/ProductTabs';
import { Button } from '@/components/ui/Button';
import { StickyAddToCart } from '@/components/product/StickyAddToCart';
import { RatingDisplay } from '@/components/product/RatingDisplay';
import dynamic from 'next/dynamic';
import { useCart } from '@/modules/cart/hooks/useCart';
import { toast } from 'react-hot-toast';

const RelatedProducts = dynamic(() => import('@/modules/products/components/RelatedProducts').then(mod => mod.RelatedProducts), {
    loading: () => <div className="h-64 animate-pulse bg-muted/50 rounded-xl mt-24"></div>
});

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
    const { data: product, isLoading, isError } = useProduct(params.slug);
    const { addItem, isAdding } = useCart();
    const [quantity, setQuantity] = React.useState(1);
    const [showSticky, setShowSticky] = React.useState(false);
    const addToCartRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleScroll = () => {
            if (!addToCartRef.current) return;
            const rect = addToCartRef.current.getBoundingClientRect();
            setShowSticky(rect.bottom < 0);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initially
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (isError) {
        notFound();
    }

    const handleAddToCart = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (!product) return;
        addItem(
            { productId: product.id, quantity },
            {
                onSuccess: () => {
                    toast.success(`${product.name} added to cart!`);
                },
                onError: (error: unknown) => {
                    toast.error((error as any)?.response?.data?.message || 'Failed to add to cart');
                }
            }
        );
    };

    if (isLoading || !product) {
        return (
            <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
                <div className="mb-8">
                    <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                </div>
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
                    <ImageGallerySkeleton />
                    <div className="flex flex-col gap-6">
                        <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-8 w-1/4 animate-pulse rounded bg-muted" />
                        <div className="h-24 w-full animate-pulse rounded bg-muted" />
                    </div>
                </div>
            </div>
        );
    }

    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: product.currency || 'USD',
    }).format(product.price);

    return (
        <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
            {/* Breadcrumb Navigation */}
            <nav className="mb-8 flex items-center text-sm text-muted-foreground" aria-label="Breadcrumb">
                <Link href="/products" className="inline-flex items-center transition-colors hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">{product.category?.name ?? 'Products'}</span>
                <span className="mx-2">/</span>
                <span className="truncate text-foreground" aria-current="page">{product.name}</span>
            </nav>

            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
                {/* Left Column: Image Gallery */}
                <div>
                    <div className="sticky top-24">
                        <ImageGallery images={product.images} productName={product.name} />
                    </div>
                </div>

                {/* Right Column: Product Info */}
                <div className="flex flex-col">
                    <div className="mb-6">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                {product.category?.name ?? ''}
                            </span>
                            {product.stock <= 5 && product.stock > 0 && (
                                <span className="rounded-full bg-amber-500/10 text-amber-500 px-3 py-1 text-xs font-semibold">
                                    Only {product.stock} left in stock
                                </span>
                            )}
                            {product.stock <= 0 && (
                                <span className="rounded-full bg-destructive/10 text-destructive px-3 py-1 text-xs font-semibold">
                                    Out of Stock
                                </span>
                            )}
                        </div>
                        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            {product.name}
                        </h1>
                        <div className="mt-3">
                            {/* Mocking a 4.8 star rating for demo since real product data lacks it */}
                            <RatingDisplay rating={4.8} count={124} />
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                            <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {formattedPrice}
                            </span>
                        </div>
                    </div>

                    <div className="mb-8 text-base text-muted-foreground sm:text-lg">
                        <p>{product.description}</p>
                    </div>

                    <div className="mb-8 border-y border-border py-6">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-foreground">Quantity</span>
                                <QuantitySelector
                                    quantity={quantity}
                                    maxQuantity={product.stock > 0 ? product.stock : 1}
                                    onChange={setQuantity}
                                />
                            </div>
                            <div ref={addToCartRef} className="w-full flex-1">
                                <Button
                                    size="lg"
                                    className="w-full rounded-xl py-6 font-semibold shadow-lg transition-all"
                                    disabled={product.stock <= 0 || isAdding}
                                    onClick={handleAddToCart}
                                >
                                    {isAdding ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                    ) : (
                                        <>
                                            <ShoppingCart className="mr-2 h-5 w-5" />
                                            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Value Props */}
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground">1-Year Warranty</span>
                                <span className="text-xs text-muted-foreground">Guarantee on all parts</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                            <Truck className="h-6 w-6 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground">Free Shipping</span>
                                <span className="text-xs text-muted-foreground">On orders over $50</span>
                            </div>
                        </div>
                    </div>

                    <ProductTabs product={product} />
                </div>
            </div>

            <RelatedProducts />

            <StickyAddToCart
                product={{
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                    stock: product.stock,
                }}
                onAdd={handleAddToCart}
                isAdding={isAdding}
                isVisible={showSticky}
            />
        </div>
    );
}
