'use client';

import { useEffect, useRef, useState } from 'react';

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

            // Scale: 1 → 1.08 over scroll
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



            </div>
        </section>
    );
}
