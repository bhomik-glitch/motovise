'use client';

import { useRef, useState } from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const demoVideos = ['/videos/bmw-m3.mp4', '/videos/demo2.mp4', '/videos/demo3.mp4'];

export function InstallationDemo() {
    const [activeIndex, setActiveIndex] = useState(0);
    const startX = useRef(0);
    const isDragging = useRef(false);

    const goToSlide = (index: number) => {
        const next = Math.max(0, Math.min(demoVideos.length - 1, index));
        setActiveIndex(next);
    };

    const goNext = () => {
        setActiveIndex((prev) => Math.min(prev + 1, demoVideos.length - 1));
    };

    const goPrev = () => {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
    };

    const handleSwipeEnd = (endX: number) => {
        if (!isDragging.current) return;

        const diff = startX.current - endX;
        const threshold = 50;

        if (diff > threshold) {
            goNext();
        } else if (diff < -threshold) {
            goPrev();
        }

        isDragging.current = false;
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        startX.current = e.touches[0]?.clientX ?? 0;
        isDragging.current = true;
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging.current) return;
        const currentX = e.touches[0]?.clientX;
        if (currentX === undefined) return;
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        const endX = e.changedTouches[0]?.clientX;
        if (endX === undefined) {
            isDragging.current = false;
            return;
        }
        handleSwipeEnd(endX);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        startX.current = e.clientX;
        isDragging.current = true;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging.current) return;
        const currentX = e.clientX;
        if (currentX === undefined) return;
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        handleSwipeEnd(e.clientX);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging.current) return;
        handleSwipeEnd(e.clientX);
    };

    return (
        <section className="mx-auto mt-32 max-w-6xl px-4">
            <ScrollReveal>
                <div className="text-center md:text-left mb-8">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-4 block">Tutorial</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-inverse)] uppercase tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                        Installation Demo
                    </h2>
                </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
                <div
                    className="relative mt-8 overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-[0_0_50px_rgba(124,156,245,0.05)] bg-[var(--color-surface)]"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >
                    <div
                        className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                    >
                        {demoVideos.map((src, index) => (
                            <div key={`${src}-${index}`} className="w-full shrink-0">
                                <div className="relative overflow-hidden h-[480px] w-full bg-black">
                                    <video
                                        src={src}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="absolute inset-0 h-full w-full object-cover opacity-90 transition-opacity duration-300 hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center gap-3 mt-6 pb-8" aria-label="Swipe indicators">
                    {demoVideos.map((video, index) => (
                        <button
                            key={`${video}-${index}`}
                            type="button"
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === activeIndex 
                                    ? 'w-8 bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]' 
                                    : 'w-2 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]'
                            }`}
                        />
                    ))}
                </div>
            </ScrollReveal>
        </section>
    );
}