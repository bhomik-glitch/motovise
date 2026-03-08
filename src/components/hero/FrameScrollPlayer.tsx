'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const FRAME_COUNT = 120;
const FIRST_PRELOAD = 10; // eagerly load first N frames

const getFrameSrc = (index: number) => {
    const padded = String(index).padStart(3, '0');
    return `/api/hero-frame/ezgif-frame-${padded}.jpg`;
};

export default function FrameScrollPlayer() {
    const sectionRef = useRef<HTMLElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const imagesRef = useRef<HTMLImageElement[]>([]);
    const currentFrameRef = useRef<number>(0);
    const rafIdRef = useRef<number>(0);
    const scheduledFrameRef = useRef<number>(0);
    const [isReady, setIsReady] = useState(false);
    const [scale, setScale] = useState(1);
    const [hasTextEntered, setHasTextEntered] = useState(false);

    // Preload frames, high priority first
    useEffect(() => {
        const imgs: HTMLImageElement[] = [];

        const loadRange = (start: number, end: number, onFirstLoad?: () => void) => {
            for (let i = start; i <= end; i++) {
                const img = new Image();
                img.src = getFrameSrc(i);
                img.decoding = 'async';

                if (i === 1 && onFirstLoad) {
                    img.onload = () => {
                        onFirstLoad();
                    };
                }
                imgs[i - 1] = img;
            }
        };

        // Immediately preload first batch
        loadRange(1, FIRST_PRELOAD, () => {
            // Show the player once first frame is ready
            if (imgRef.current) {
                imgRef.current.src = getFrameSrc(1);
            }
            setIsReady(true);
        });

        // Lazily load remaining frames
        setTimeout(() => {
            loadRange(FIRST_PRELOAD + 1, FRAME_COUNT);
        }, 400);

        imagesRef.current = imgs;

        return () => {
            cancelAnimationFrame(rafIdRef.current);
        };
    }, []);

    // One-time text trigger when user scrolls past 10% viewport height
    useEffect(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    setHasTextEntered(true);
                    observer.disconnect();
                }
            },
            { threshold: 0 }
        );

        observer.observe(trigger);
        return () => observer.disconnect();
    }, []);

    // Scroll handler
    useEffect(() => {
        const handleScroll = () => {
            const section = sectionRef.current;
            if (!section) return;

            const rect = section.getBoundingClientRect();
            const scrollTop = -rect.top;
            const maxScroll = rect.height - window.innerHeight;
            const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

            // Frame animation
            const frameIndex = Math.floor(progress * (FRAME_COUNT - 1));

            if (frameIndex !== scheduledFrameRef.current) {
                scheduledFrameRef.current = frameIndex;
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = requestAnimationFrame(() => {
                    const f = scheduledFrameRef.current;
                    if (f !== currentFrameRef.current && imgRef.current) {
                        const img = imagesRef.current[f];
                        if (img?.complete && img.naturalWidth > 0) {
                            imgRef.current.src = img.src;
                            currentFrameRef.current = f;
                        } else if (img) {
                            // Frame not loaded yet - use src directly (browser will handle)
                            imgRef.current.src = getFrameSrc(f + 1);
                            currentFrameRef.current = f;
                        }
                    }
                });
            }

            // Scale: 1 -> 1.08 over scroll
            const newScale = 1 + progress * 0.08;
            setScale(newScale);

            // Overlay opacity: subtle at start, stronger near end
            if (overlayRef.current) {
                overlayRef.current.style.opacity = String(0.3 + progress * 0.4);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial call

        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(rafIdRef.current);
        };
    }, []);

    return (
        /* Hero Wrapper: tall enough for scroll-driving */
        <section
            ref={sectionRef}
            className="relative"
            style={{ height: '200vh' }}
            aria-label="Motovise cinematic hero"
        >
            {/* Trigger marker at 10% viewport height */}
            <div
                ref={triggerRef}
                className="absolute left-0 right-0 pointer-events-none"
                style={{ top: '10vh', height: 1 }}
                aria-hidden="true"
            />

            {/* Sticky viewport that stays while user scrolls */}
            <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#F8FAFC]">
                {/* Frame image */}
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                        transform: `scale(${scale})`,
                        transition: 'transform 0.1s linear',
                        transformOrigin: 'center center',
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        ref={imgRef}
                        src={getFrameSrc(1)}
                        alt="Motovise automotive hero"
                        className="w-full h-full object-cover"
                        style={{
                            opacity: isReady ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                        }}
                    />
                </div>

                {/* Gradient overlay - bottom fade into pastel */}
                <div
                    ref={overlayRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(to top, #EEF2FF 0%, transparent 60%)',
                        opacity: 0.3,
                    }}
                />

                {/* Desktop/Tablet side texts */}
                <motion.p
                    className="hidden md:block absolute left-[6%] top-1/2 -translate-y-1/2 z-20 max-w-[300px] text-white/75"
                    initial={{ x: '-120%', opacity: 0 }}
                    animate={hasTextEntered ? { x: 0, opacity: 0.75 } : { x: '-120%', opacity: 0 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    style={{ fontSize: 'clamp(16px, 1.3vw, 20px)' }}
                >
                    Because your car deserves more than stock.
                </motion.p>

                <motion.h1
                    className="hidden md:block absolute right-[6%] top-1/2 -translate-y-1/2 z-20 text-white font-bold tracking-[-0.02em] text-right max-w-[560px] leading-tight"
                    initial={{ x: '120%', opacity: 0 }}
                    animate={hasTextEntered ? { x: 0, opacity: 1 } : { x: '120%', opacity: 0 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    style={{ fontSize: 'clamp(36px, 4vw, 60px)' }}
                >
                    Motovise - Give Your Car Wings
                </motion.h1>

                {/* Mobile stacked text (no side-slide animation) */}
                <div className="md:hidden absolute top-14 left-1/2 -translate-x-1/2 z-20 w-[92%] text-center text-white">
                    <p
                        className="mx-auto max-w-[300px] leading-relaxed text-white/75"
                        style={{ fontSize: 'clamp(14px, 3.8vw, 18px)' }}
                    >
                        Because your car deserves more than stock.
                    </p>
                    <h1
                        className="mt-3 font-bold tracking-[-0.02em] leading-tight"
                        style={{ fontSize: 'clamp(30px, 7.2vw, 42px)' }}
                    >
                        Motovise - Give Your Car Wings
                    </h1>
                </div>
            </div>
        </section>
    );
}
