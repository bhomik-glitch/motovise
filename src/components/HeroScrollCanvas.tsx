'use client';

import { useEffect, useRef } from 'react';

export default function HeroScrollCanvas() {
    const frameCount = 72; // Set frame count closely to prompt expectations
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sectionRef = useRef<HTMLElement>(null);

    // Animation state refs - no React state to avoid re-rendering
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const currentFrameRef = useRef<number>(-1);
    const rafIdRef = useRef<number>(0);
    const scheduledFrameRef = useRef<number>(0);

    // Pad numbers like 001, 002
    const getFramePath = (index: number) => {
        const paddedIndex = String(index).padStart(3, '0');
        return `/api/hero-frame/ezgif-frame-${paddedIndex}.jpg`;
    };

    const drawFrame = (frameIndex: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const img = imagesRef.current[frameIndex];

        if (!ctx || !img || !img.complete || img.naturalWidth === 0) return;

        // Set physical resolution of canvas
        const dpr = window.devicePixelRatio || 1;
        // We want the canvas to match the viewport size exactly
        const cssW = window.innerWidth;
        const cssH = window.innerHeight;

        // Resize the canvas physical pixel size if needed
        if (canvas.width !== Math.floor(cssW * dpr) || canvas.height !== Math.floor(cssH * dpr)) {
            canvas.width = Math.floor(cssW * dpr);
            canvas.height = Math.floor(cssH * dpr);
        }

        // Temporarily reset transform to clear fully
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Scale context back resolving devicePixelRatio
        ctx.scale(dpr, dpr);

        // Apply proper centering and scale without stretching
        const scale = Math.max(
            cssW / img.naturalWidth,
            cssH / img.naturalHeight
        );

        const drawW = img.naturalWidth * scale;
        const drawH = img.naturalHeight * scale;

        const x = (cssW - drawW) / 2;
        const y = (cssH - drawH) / 2;

        ctx.drawImage(img, x, y, drawW, drawH);
    };

    const handleScroll = () => {
        const section = sectionRef.current;
        if (!section) return;

        // Calculate scroll progress relative ONLY to the section
        const rect = section.getBoundingClientRect();
        const scrollTop = -rect.top;

        // amount of scroll allowed inside the section:
        const maxScroll = rect.height - window.innerHeight;

        // clamp progress between 0 and 1
        const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

        // map progress to frame index
        const frameIndex = Math.floor(progress * (frameCount - 1));

        if (frameIndex === scheduledFrameRef.current) return;
        scheduledFrameRef.current = frameIndex;

        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
            const frameToDraw = scheduledFrameRef.current;
            if (frameToDraw !== currentFrameRef.current) {
                currentFrameRef.current = frameToDraw;
                drawFrame(frameToDraw);
            }
        });
    };

    useEffect(() => {
        let firstLoaded = false;

        // Preload all 120 frames
        const images: HTMLImageElement[] = [];
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            img.decoding = 'async';

            if (i === 1) {
                img.onload = () => {
                    if (!firstLoaded) {
                        firstLoaded = true;
                        drawFrame(0);
                        handleScroll(); // Trigger a scroll handle to ensure correct frame matches page position
                    }
                };
            }
            images.push(img);
        }
        imagesRef.current = images;

        const onScroll = () => handleScroll();
        const onResize = () => {
            drawFrame(currentFrameRef.current);
            handleScroll();
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });

        // Initial draw
        handleScroll();

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(rafIdRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section ref={sectionRef} className="relative h-[400vh]">
            <div className="sticky top-0 h-screen w-full flex items-center justify-center bg-white overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="block w-full h-full"
                />
            </div>
        </section>
    );
}
