'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

type BestSellerProduct = {
    id: number;
    name: string;
    price: string;
    image: string;
};

const bestSellerProducts: BestSellerProduct[] = [
    { id: 1, name: 'Performance Brake Kit', price: '₹4,999', image: '/products/brake.jpg' },
    { id: 2, name: 'Carbon Fiber Mirror Caps', price: '₹2,199', image: '/products/mirror.jpg' },
    { id: 3, name: 'Sport Exhaust Tip', price: '₹3,499', image: '/products/exhaust.jpg' },
    { id: 4, name: 'LED Headlight Upgrade', price: '₹5,299', image: '/products/headlight.jpg' },
    { id: 5, name: 'Performance Air Intake', price: '₹3,899', image: '/products/intake.jpg' },
    { id: 6, name: 'Carbon Fiber Spoiler', price: '₹6,499', image: '/products/spoiler.jpg' },
    { id: 7, name: 'Sport Steering Wheel', price: '₹7,299', image: '/products/steering.jpg' },
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

                const recycleDistance = firstCard.offsetWidth + 24;

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
        <div className="w-full">
            <h2 className="text-2xl font-semibold text-[#0F172A] md:text-3xl">Best Sellers</h2>

            <div
                ref={scrollRef}
                onMouseEnter={() => {
                    pauseRef.current = true;
                }}
                onMouseLeave={() => {
                    pauseRef.current = false;
                }}
                className="mt-8 flex gap-6 overflow-x-auto overflow-y-visible pb-6 touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                style={{ scrollBehavior: 'auto' }}
                aria-label="Best sellers products"
            >
                {bestSellerProducts.map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="group w-[200px] shrink-0 snap-start md:w-[240px] lg:w-[260px]"
                    >
                        <div className="transform-gpu transition-all duration-300 ease-out group-hover:-translate-y-1.5">
                            <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
                                <div className="relative aspect-square overflow-hidden rounded-xl bg-[#EEF2FF]">
                                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-[#E0E7FF] to-[#FDE2E4]" />
                                </div>

                                <div className="pt-4">
                                    <p className="truncate text-sm font-medium text-[#0F172A] md:text-base">
                                        {product.name}
                                    </p>
                                    <p className="mt-1 text-base font-bold text-[#0F172A]">{product.price}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
