'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Montserrat } from 'next/font/google';

const FRAME_COUNT = 251;
const FIRST_PRELOAD = 10; // eagerly load first N frames
const CACHE_VERSION = 'v2'; // Added version suffix to bust cache

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
});

const getFrameSrc = (index: number) => {
    const padded = String(index).padStart(3, '0');
    return `/api/hero-frame/ezgif-frame-${padded}.jpg?v=${CACHE_VERSION}`;
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

    const [isMotoviseVisible, setIsMotoviseVisible] = useState(false);
    const [isLeftTextVisible, setIsLeftTextVisible] = useState(false);
    const [isWingsVisible, setIsWingsVisible] = useState(false);

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

        loadRange(1, FIRST_PRELOAD, () => {
            if (imgRef.current) {
                imgRef.current.src = getFrameSrc(1);
            }
            setIsReady(true);
        });

        setTimeout(() => {
            loadRange(FIRST_PRELOAD + 1, FRAME_COUNT);
        }, 4000); // Increased timeout for preloading more frames

        imagesRef.current = imgs;

        return () => {
            cancelAnimationFrame(rafIdRef.current);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const section = sectionRef.current;
            if (!section) return;

            const rect = section.getBoundingClientRect();
            const scrollTop = -rect.top;
            const maxScroll = rect.height - window.innerHeight;
            const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

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
                            imgRef.current.src = getFrameSrc(f + 1);
                            currentFrameRef.current = f;
                        }
                    }
                });
            }

            const newScale = 1 + progress * 0.08;
            setScale(newScale);

            if (overlayRef.current) {
                overlayRef.current.style.opacity = String(0.3 + progress * 0.4);
            }

            const vh = window.innerHeight;
            const motoviseThreshold = vh * 0.1;
            const leftThreshold = vh * 0.12;
            const wingsThreshold = vh * 0.15;

            const y = window.scrollY;
            setIsMotoviseVisible((prev) => (prev === (y >= motoviseThreshold) ? prev : y >= motoviseThreshold));
            setIsLeftTextVisible((prev) => (prev === (y >= leftThreshold) ? prev : y >= leftThreshold));
            setIsWingsVisible((prev) => (prev === (y >= wingsThreshold) ? prev : y >= wingsThreshold));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(rafIdRef.current);
        };
    }, []);

    const textShadow = '0 4px 16px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.25)';

    return (
        <section
            ref={sectionRef}
            className="relative"
            style={{ height: '500vh' }}

            aria-label="Motovise cinematic hero"
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#F8FAFC]">
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

                <div
                    ref={overlayRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(to top, #EEF2FF 0%, transparent 60%)',
                        opacity: 0.3,
                    }}
                />

                <motion.p
                    className={`hidden md:block absolute left-[6%] top-1/2 -translate-y-1/2 z-20 text-white ${montserrat.className}`}
                    initial={{ x: -200, opacity: 0 }}
                    animate={isLeftTextVisible ? { x: 0, opacity: 1 } : { x: -200, opacity: 0 }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        fontWeight: 500,
                        fontSize: 'clamp(18px,1.4vw,24px)',
                        lineHeight: 1.4,
                        maxWidth: 320,
                        textShadow,
                    }}
                >
                    Because your car
                    <br />
                    deserves more than
                    <br />
                    stock
                </motion.p>

                <div className={`hidden md:block absolute right-[6%] top-1/2 -translate-y-1/2 z-20 text-right max-w-[620px] ${montserrat.className}`}>
                    <motion.div
                        initial={{ x: 200, opacity: 0 }}
                        animate={isMotoviseVisible ? { x: 0, opacity: 1 } : { x: 200, opacity: 0 }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className="tracking-[-0.02em]"
                        style={{
                            fontWeight: 800,
                            fontSize: 'clamp(44px,4vw,72px)',
                            color: '#8CC63F',
                            textShadow,
                        }}
                    >
                        Motovise
                    </motion.div>
                    <motion.div
                        initial={{ x: 200, opacity: 0 }}
                        animate={isWingsVisible ? { x: 0, opacity: 1 } : { x: 200, opacity: 0 }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className="text-white mt-[6px]"
                        style={{
                            fontWeight: 500,
                            fontSize: 'clamp(24px,2vw,36px)',
                            textShadow,
                        }}
                    >
                        Give Your Car Wings
                    </motion.div>
                </div>

                <div className={`md:hidden absolute top-14 left-1/2 -translate-x-1/2 z-20 w-[92%] text-center ${montserrat.className}`}>
                    <p
                        className="mx-auto text-white"
                        style={{
                            fontWeight: 500,
                            lineHeight: 1.4,
                            maxWidth: 320,
                            fontSize: 'clamp(18px,4.3vw,24px)',
                            textShadow,
                        }}
                    >
                        Because your car
                        <br />
                        deserves more than
                        <br />
                        stock
                    </p>
                    <h1 className="mt-4 leading-tight">
                        <span
                            className="block tracking-[-0.02em]"
                            style={{
                                fontWeight: 800,
                                fontSize: 'clamp(40px,10vw,60px)',
                                color: '#8CC63F',
                                textShadow,
                            }}
                        >
                            Motovise
                        </span>
                        <span
                            className="block text-white mt-[6px]"
                            style={{
                                fontWeight: 500,
                                fontSize: 'clamp(22px,5.5vw,34px)',
                                textShadow,
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
