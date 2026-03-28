"use client";

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useProduct } from '@/modules/products/hooks/useProduct';
import { ProductGallery, ProductGallerySkeleton } from '@/modules/products/components/ProductGallery';
import { ProductInfo, ProductInfoSkeleton } from '@/modules/products/components/ProductInfo';
import { ProductTabs } from '@/modules/products/components/ProductTabs';

// ─── Skeleton ────────────────────────────────────────────────────────────────
function ProductPageSkeleton() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-10">
            <div className="h-5 w-28 rounded bg-gray-200 animate-pulse mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-16">
                <ProductGallerySkeleton />
                <ProductInfoSkeleton />
            </div>
        </div>
    );
}

// ─── Not Found ────────────────────────────────────────────────────────────────
function ProductNotFound() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 py-24 flex flex-col items-center text-center gap-4">
            <span className="text-6xl">📦</span>
            <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
            <p className="text-gray-500 max-w-sm">
                This product doesn&apos;t exist or may have been removed.
            </p>
            <Link
                href="/products"
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Products
            </Link>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProductPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    console.log("Route slug:", slug);
    const { data: product, isLoading, isError } = useProduct(slug);

    if (isLoading) return <ProductPageSkeleton />;
    if (isError || !product) return <ProductNotFound />;

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-10">
                <Link href="/products" className="hover:text-gray-900 transition-colors flex items-center gap-1.5">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Products
                </Link>
                {product.category && (
                    <>
                        <span>/</span>
                        <span>{product.category.name}</span>
                    </>
                )}
                <span>/</span>
                <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
            </nav>

            {/* Main 2-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-16 items-start">

                {/* LEFT — Gallery (60%) */}
                <div className="md:sticky md:top-28">
                    <ProductGallery images={product.images} productName={product.name} />
                </div>

                {/* RIGHT — Info + CTA (40%) */}
                <div>
                    <ProductInfo product={product} />
                </div>
            </div>

            {/* Tabs: Overview, Specs, Compatibility, Box, Shipping */}
            <div className="mt-20">
                <ProductTabs product={product} />
            </div>
        </div>
    );
}
