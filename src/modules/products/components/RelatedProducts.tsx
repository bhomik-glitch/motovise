"use client";

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

// Realistically this would fetch based on product category or tags
const fetchRelatedProducts = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return Array.from({ length: 4 }).map((_, i) => ({
        id: `related-${i}`,
        name: `Complementary Product ${i + 1}`,
        description: 'Perfect companion for your purchase.',
        price: Math.floor(Math.random() * 100) + 10,
        currency: 'USD',
        images: [`https://picsum.photos/seed/related${i}/400/500`],
        category: 'Accessories',
        stock: 20,
        slug: `complementary-product-${i + 1}`,
        attributes: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }));
};

export function RelatedProducts() {
    const { data: products, isLoading } = useQuery({
        queryKey: ['related-products'],
        queryFn: fetchRelatedProducts,
    });

    return (
        <div className="mt-24 lg:mt-32">
            <h2 className="mb-8 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                You Might Also Like
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                ) : (
                    products?.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                )}
            </div>
        </div>
    );
}
