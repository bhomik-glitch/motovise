'use client';

import { useRef, useState } from 'react';

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
            <h2 className="text-2xl font-semibold text-[#0F172A] md:text-3xl">Installation Demo</h2>

            <div
                className="relative mt-8 overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {demoVideos.map((src, index) => (
                        <div key={`${src}-${index}`} className="w-full shrink-0">
                            <div className="relative overflow-hidden rounded-2xl h-[480px] w-full">
                                <video
                                    src={src}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="absolute inset-0 h-full w-full object-cover scale-[1.02]"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center gap-2 mt-4" aria-label="Swipe indicators">
                {demoVideos.map((video, index) => (
                    <button
                        key={`${video}-${index}`}
                        type="button"
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-2 w-2 rounded-full ${index === activeIndex ? 'bg-gray-800' : 'bg-gray-300'}`}
                    />
                ))}
            </div>
        </section>
    );
}