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

            // Replayable text trigger based on viewport threshold (10vh)
            const threshold = window.innerHeight * 0.1;
            const shouldShowText = window.scrollY >= threshold;
            setHasTextEntered((prev) => (prev === shouldShowText ? prev : shouldShowText));
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
                    className="hidden md:block absolute left-[6%] top-1/2 -translate-y-1/2 z-20 text-white"
                    initial={{ x: -200, opacity: 0 }}
                    animate={hasTextEntered ? { x: 0, opacity: 1 } : { x: -200, opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        fontSize: 'clamp(18px, 1.4vw, 24px)',
                        fontWeight: 500,
                        lineHeight: 1.4,
                        maxWidth: 320,
                        textShadow: '0 4px 16px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.25)',
                    }}
                >
                    Because your car
                    <br />
                    deserves more than
                    <br />
                    stock
                </motion.p>

                <motion.h1
                    className="hidden md:block absolute right-[6%] top-1/2 -translate-y-1/2 z-20 text-right max-w-[600px] leading-tight"
                    initial={{ x: 200, opacity: 0 }}
                    animate={hasTextEntered ? { x: 0, opacity: 1 } : { x: 200, opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{ textShadow: '0 4px 16px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.25)' }}
                >
                    <span
                        className="block tracking-[-0.02em]"
                        style={{
                            fontWeight: 800,
                            fontSize: 'clamp(40px, 4vw, 64px)',
                            color: '#8CC63F',
                        }}
                    >
                        Motovise
                    </span>
                    <span
                        className="block text-white mt-2"
                        style={{
                            fontWeight: 500,
                            fontSize: 'clamp(24px, 2vw, 36px)',
                        }}
                    >
                        Give Your Car Wings
                    </span>
                </motion.h1>

                {/* Mobile stacked text (no side-slide animation) */}
                <div className="md:hidden absolute top-14 left-1/2 -translate-x-1/2 z-20 w-[92%] text-center">
                    <p
                        className="mx-auto leading-relaxed text-white"
                        style={{
                            maxWidth: 320,
                            fontSize: 'clamp(16px, 4vw, 22px)',
                            fontWeight: 500,
                            textShadow: '0 4px 16px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.25)',
                        }}
                    >
                        Because your car
                        <br />
                        deserves more than
                        <br />
                        stock
                    </p>
                    <h1
                        className="mt-4 leading-tight"
                        style={{ textShadow: '0 4px 16px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.25)' }}
                    >
                        <span
                            className="block tracking-[-0.02em]"
                            style={{
                                fontWeight: 800,
                                fontSize: 'clamp(32px, 8vw, 44px)',
                                color: '#8CC63F',
                            }}
                        >
                            Motovise
                        </span>
                        <span
                            className="block text-white mt-2"
                            style={{
                                fontWeight: 500,
                                fontSize: 'clamp(20px, 5vw, 28px)',
                            }}
                        >
                            Give Your Car Wings
                        </span>
                    </h1>
                </div>
            </div>
        </section>
    );
}
