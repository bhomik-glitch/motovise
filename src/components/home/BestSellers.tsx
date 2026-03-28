'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

type BestSellerProduct = {
    id: number;
    name: string;
    price: string;
    image: string;
};

const bestSellerProducts: BestSellerProduct[] = [
    { id: 1, name: 'Performance Brake Kit', price: '$4,999', image: '/products/brake.jpg' },
    { id: 2, name: 'Carbon Fiber Mirror Caps', price: '$2,199', image: '/products/mirror.jpg' },
    { id: 3, name: 'Sport Exhaust Tip', price: '$3,499', image: '/products/exhaust.jpg' },
    { id: 4, name: 'LED Headlight Upgrade', price: '$5,299', image: '/products/headlight.jpg' },
    { id: 5, name: 'Performance Air Intake', price: '$3,899', image: '/products/intake.jpg' },
    { id: 6, name: 'Carbon Fiber Spoiler', price: '$6,499', image: '/products/spoiler.jpg' },
    { id: 7, name: 'Sport Steering Wheel', price: '$7,299', image: '/products/steering.jpg' },
];

export function BestSellers() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const pauseRef = useRef(false);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        let frameId: number;

        const step = () => {
            if (!pauseRef.current) {
                container.scrollLeft += 1;

                const firstCard = container.firstElementChild as HTMLElement;

                if (!firstCard) return;

                const recycleDistance = firstCard.offsetWidth + 24; // gap-6 (24px)

                if (container.scrollLeft >= recycleDistance) {
                    container.appendChild(firstCard);
                    container.scrollLeft -= recycleDistance;
                }
            }

            frameId = requestAnimationFrame(step);
        };

        frameId = requestAnimationFrame(step);

        return () => cancelAnimationFrame(frameId);
    }, []);

    return (
        <section className="w-full py-24 relative z-10 overflow-hidden bg-[var(--color-bg)]">
            <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-transparent via-[#1a1c23]/30 to-[var(--color-bg)] pointer-events-none" />
            
            <div className="hp-container max-w-[1400px] mb-12 flex items-end justify-between">
                <ScrollReveal>
                    <h2 className="text-sm font-bold tracking-widest text-[var(--color-accent)] uppercase mb-3">Trending</h2>
                    <h3 className="text-3xl md:text-5xl font-bold text-[var(--color-text-inverse)] tracking-tight">Best Sellers</h3>
                </ScrollReveal>
                <ScrollReveal delay={0.2} className="hidden md:block">
                    <Link href="/products" className="text-[var(--color-text-muted)] hover:text-white transition-colors text-sm font-bold uppercase tracking-widest relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-white after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left after:transition-transform">
                        View Complete Catalog
                    </Link>
                </ScrollReveal>
            </div>

            <ScrollReveal delay={0.1}>
                {/* 
                  The container wrapper handles the fade mask on the edges 
                  so scroll items fade out cleanly.
                */}
                <div className="relative w-full [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
                    <div
                        ref={scrollRef}
                        onMouseEnter={() => {
                            pauseRef.current = true;
                        }}
                        onMouseLeave={() => {
                            pauseRef.current = false;
                        }}
                        className="flex gap-6 overflow-x-auto overflow-y-visible pb-12 pt-4 px-8 touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                        style={{ scrollBehavior: 'auto' }}
                        aria-label="Best sellers products"
                    >
                        {bestSellerProducts.map((product, idx) => (
                            <Link
                                key={`${product.id}-${idx}`}
                                href={`/product/${product.id}`}
                                className="group w-[240px] shrink-0 snap-start md:w-[280px] lg:w-[320px]"
                            >
                                <div className="transform-gpu transition-all duration-500 ease-out group-hover:-translate-y-4">
                                    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(124,156,245,0.15)] group-hover:bg-[#1a1c23]/80 group-hover:border-[var(--color-accent)]/30 backdrop-blur-xl">
                                        <div className="relative aspect-square overflow-hidden rounded-xl bg-[#111216]">
                                            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#1a1c23] to-black opacity-50 group-hover:scale-105 transition-transform duration-700" />
                                            {/* We can use image here in real scenario: 
                                            <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700" /> */}
                                        </div>

                                        <div className="pt-6 pb-2 px-2">
                                            <p className="truncate text-base font-bold text-[var(--color-text-inverse)] group-hover:text-[var(--color-accent)] transition-colors">
                                                {product.name}
                                            </p>
                                            <p className="mt-2 text-sm font-mono tracking-wider text-[var(--color-text-muted)] group-hover:text-white transition-colors">{product.price}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </ScrollReveal>
        </section>
    );
}
