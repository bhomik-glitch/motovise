'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef, useMemo, useState } from 'react';
import { ShoppingCart, ArrowRight, Zap, Shield, Headphones } from 'lucide-react';

import { useCart } from '@/modules/cart/hooks/useCart';
import { toast } from 'react-hot-toast';
import { useFeaturedProducts } from '@/modules/products/hooks/useProducts';
import { Product } from '@/types/product';

// Lazy load the heavy frame player
const FrameScrollPlayer = dynamic(
    () => import('@/components/hero/FrameScrollPlayer'),
    {
        ssr: false,
        loading: () => (
            <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]" />
        ),
    }
);

// ─── Mock Product Data ────────────────────────────────────────────────────────
const featuredProducts = Array.from({ length: 6 }).map((_, i) => ({
    id: `feat-${i + 1}`,
    name: [
        'Carbon Fiber Spoiler Pro',
        'Performance Air Filter Kit',
        'LED Headlight Upgrade',
        'Racing Brake Pads Set',
        'Sport Exhaust System',
        'OBD2 Diagnostic Scanner',
    ][i],
    price: [299, 89, 249, 149, 599, 79][i],
    category: ['Exterior', 'Engine', 'Lighting', 'Brakes', 'Exhaust', 'Electronics'][i],
    image: `https://picsum.photos/seed/${i + 200}/600/750`,
    slug: `product-${i + 1}`,
    badge: i === 0 ? 'New' : i === 2 ? 'Best Seller' : null,
}));

// ─── Feature Cards ────────────────────────────────────────────────────────────
const features = [
    {
        icon: Zap,
        title: 'Fast Delivery',
        desc: 'Next-day shipping on most orders. Priority handling for performance parts.',
        color: '#7C9CF5',
    },
    {
        icon: Shield,
        title: 'Genuine Parts',
        desc: 'Every component certified. OEM-grade quality with manufacturer warranty.',
        color: '#A5B4FC',
    },
    {
        icon: Headphones,
        title: 'Expert Support',
        desc: 'Talk to real car enthusiasts. Our team lives and breathes performance.',
        color: '#FDBA74',
    },
];

// ─── Product Card Component ────────────────────────────────────────────────────
function FeaturedProductCard({
    product,
    index,
}: {
    product: Product;
    index: number;
}) {
    const [hovered, setHovered] = useState(false);
    const { addItem } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        addItem(
            { productId: product.id, quantity: 1 },
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

    // Extract badge or category name
    const categoryName = (product.category as any)?.name || product.category || 'Automotive';
    const productImage = product.images?.[0] || `https://picsum.photos/seed/${product.id}/600/750`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-[#E2E8F0] shadow-md cursor-pointer"
            style={{
                transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: hovered
                    ? '0 20px 60px rgba(124,156,245,0.2), 0 4px 16px rgba(0,0,0,0.08)'
                    : '0 4px 16px rgba(0,0,0,0.06)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
        >
            <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={product.name} />

            {/* Image */}
            <div className="relative aspect-square w-full overflow-hidden bg-[#F8FAFC]">
                <Image
                    src={product.thumbnail || product.images?.[0] || "/images/product-placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500"
                    style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
                    sizes="(max-width:768px) 50vw, 300px"
                />

                {/* Badge (Mocking since real data might not have it) */}
                {index === 0 && (
                    <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#7C9CF5] text-white shadow-sm">
                        New
                    </div>
                )}

                {/* Hover Overlay with actions */}
                <div
                    className="absolute inset-x-0 bottom-0 z-20 p-4 flex gap-2 transition-all duration-300"
                    style={{
                        transform: hovered ? 'translateY(0)' : 'translateY(100%)',
                        opacity: hovered ? 1 : 0,
                    }}
                >
                    <button
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors z-30 relative"
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                    </button>
                    <button
                        className="px-3 py-2.5 rounded-lg text-sm font-medium bg-white/90 text-[#0F172A] hover:bg-white transition-colors z-30 relative border border-[#E2E8F0]"
                        onClick={(e) => { e.preventDefault(); }}
                    >
                        Preview
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-1.5 flex-grow">
                <p className="text-xs font-medium text-[#7C9CF5] uppercase tracking-wide">
                    {categoryName}
                </p>
                <h3 className="text-sm font-semibold text-[#0F172A] leading-snug line-clamp-2">
                    {product.name}
                </h3>
                <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-base font-bold text-[#0F172A]">
                        ${Number(product.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-[#64748B]">Free shipping</span>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Home Page ─────────────────────────────────────────────────────────────────
export default function Home() {
    const productsRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const productsInView = useInView(productsRef, { once: true, margin: '-80px' });
    const featuresInView = useInView(featuresRef, { once: true, margin: '-80px' });

    const { data: featuredProducts, isLoading: productsLoading } = useFeaturedProducts();

    return (
        <div className="flex flex-col bg-[#F8FAFC]">
            {/* ── Hero Frame Animation ── */}
            <FrameScrollPlayer />

            <section className="w-full py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                        Future Section Placeholder
                    </div>
                </div>
            </section>

            {/* ── Feature Banner ── */}
            <section
                ref={featuresRef}
                className="bg-[#EEF2FF] py-16 border-t border-[#E2E8F0]"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-10"
                    >
                        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#7C9CF5] mb-3">
                            Why Motovise
                        </p>
                        <h2
                            className="text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Built Around Driver Experience
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 40 }}
                                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                                className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                                    style={{ backgroundColor: `${f.color}20` }}
                                >
                                    <f.icon className="h-5 w-5" style={{ color: f.color }} />
                                </div>
                                <h3 className="text-base font-semibold text-[#0F172A] mb-1.5">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-[#64748B] leading-relaxed">
                                    {f.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Featured Products ── */}
            <section className="py-20 bg-[#F8FAFC]" ref={productsRef}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={productsInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="flex items-end justify-between mb-10"
                    >
                        <div>
                            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#7C9CF5] mb-3">
                                Featured Parts
                            </p>
                            <h2
                                className="text-3xl md:text-4xl font-bold text-[#0F172A]"
                                style={{ fontFamily: "'Syne', sans-serif" }}
                            >
                                Precision Picks
                            </h2>
                        </div>
                        <Link
                            href="/products"
                            className="hidden md:flex items-center gap-2 text-sm font-medium text-[#7C9CF5] hover:text-[#0F172A] transition-colors group"
                        >
                            View all
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </motion.div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {productsLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-96 rounded-xl bg-slate-200 animate-pulse" />
                            ))
                        ) : (
                            featuredProducts?.map((product: Product, i: number) => (
                                <FeaturedProductCard
                                    key={product.id}
                                    product={product}
                                    index={i}
                                />
                            ))
                        )}
                    </div>

                    {/* Mobile CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={productsInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="mt-10 text-center md:hidden"
                    >
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7C9CF5] text-white font-medium text-sm hover:bg-[#A5B4FC] transition-colors btn-glow"
                        >
                            Shop All Products
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="py-20 bg-[#EEF2FF]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7C9CF5] via-[#A5B4FC] to-[#FDBA74] p-10 md:p-16 text-center">
                        {/* Decorative circles */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />

                        <p className="relative text-xs font-semibold tracking-[0.3em] uppercase text-white/70 mb-4">
                            Driver Community
                        </p>
                        <h2
                            className="relative text-3xl md:text-5xl font-bold text-white leading-tight mb-4"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                        >
                            Ready to Elevate<br />Your Drive?
                        </h2>
                        <p className="relative text-base text-white/80 max-w-md mx-auto mb-8">
                            Join 10,000+ enthusiasts who trust Motovise for their performance upgrades.
                        </p>
                        <Link
                            href="/products"
                            className="relative inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[#0F172A] font-semibold hover:bg-white/90 transition-colors shadow-lg btn-glow"
                        >
                            Shop Now
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

