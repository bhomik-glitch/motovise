'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap/dist/gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
const FRAME_COUNT = 240;
const CACHE_VERSION = 'v3';

const getFrameSrc = (index: number) => {
  const padded = String(index).padStart(3, '0');
  return `/api/hero-frame/ezgif-frame-${padded}.jpg?v=${CACHE_VERSION}`;
};

function initCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  return ctx;
}

export default function BottomFrameScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastFrameRef = useRef(-1);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const images: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFrameSrc(i + 1);
      img.decoding = 'async';

      if (i === 0) {
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = initCanvas(canvas);
          ctxRef.current = ctx;
          ctx.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
          lastFrameRef.current = 0;
          setIsReady(true);
        };
      }

      images[i] = img;
    }

    imagesRef.current = images;
  }, []);

  useEffect(() => {
    if (!isReady) return;

    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    // Set initial off-screen positions
    gsap.set(leftRef.current, { x: '-110vw', opacity: 0 });
    gsap.set(rightRef.current, { x: '110vw', opacity: 0 });
    gsap.set(ctaRef.current, { opacity: 0, y: 24 });

    const renderFrame = (progress: number) => {
      const frameIdx = Math.min(
        Math.floor(progress * (FRAME_COUNT - 1)),
        FRAME_COUNT - 1,
      );
      if (frameIdx === lastFrameRef.current) return;
      lastFrameRef.current = frameIdx;

      const img = imagesRef.current[frameIdx];
      if (!img?.complete || !img.naturalWidth) return;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
    };

    renderFrame(0);

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      invalidateOnRefresh: true,
      onEnter: () => renderFrame(0),
      onEnterBack: () => renderFrame(0),
      onUpdate: (self) => {
        const p = self.progress;

        renderFrame(p);

        // Scale matches top hero: 1.0 → 1.05
        if (wrapperRef.current) {
          const scale = 1 + p * 0.05;
          wrapperRef.current.style.transform = `scale(${scale})`;
        }

        // Left panel slides in from left — completes at 45% scroll
        if (leftRef.current) {
          const t = Math.min(p / 0.45, 1);
          const eased = 1 - Math.pow(1 - t, 3); // cubic ease out
          const x = -110 + eased * 110; // vw units: -110vw → 0
          leftRef.current.style.transform = `translateX(${x}vw)`;
          leftRef.current.style.opacity = String(Math.min(1, t * 1.8));
        }

        // Right panel slides in from right — completes at 45% scroll
        if (rightRef.current) {
          const t = Math.min(p / 0.45, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const x = 110 - eased * 110;
          rightRef.current.style.transform = `translateX(${x}vw)`;
          rightRef.current.style.opacity = String(Math.min(1, t * 1.8));
        }

        // CTA fades up from 55% scroll onwards
        if (ctaRef.current) {
          const t = Math.max(0, (p - 0.55) / 0.35);
          const clamped = Math.min(1, t);
          ctaRef.current.style.opacity = String(clamped);
          ctaRef.current.style.transform = `translateY(${24 - clamped * 24}px)`;
        }
      },
    });

    const handleResize = () => {
      const newCtx = initCanvas(canvas);
      ctxRef.current = newCtx;
      lastFrameRef.current = -1;
      renderFrame(st.progress);
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      st.kill();
      window.removeEventListener('resize', handleResize);
    };
  }, [isReady]);

  const textShadow = '0 4px 20px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.35)';

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: 'calc(100vh + 2000px)' }}
      aria-label="Motovise upgrade your drive"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

        {/* Canvas */}
        <div
          ref={wrapperRef}
          className="absolute inset-0"
          style={{ transformOrigin: 'center center', willChange: 'transform' }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.4s ease' }}
          />
        </div>

        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)' }}
        />

        {/* Bottom gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)' }}
        />

        {/* LEFT panel — slides in from left */}
        <div
          ref={leftRef}
          className={`absolute left-[5%] top-1/2 -translate-y-1/2 z-20 max-w-[280px] font-sans`}
          style={{ willChange: 'transform, opacity' }}
        >
          <p
            className="text-white/50 uppercase mb-2"
            style={{ fontSize: 'clamp(9px,0.9vw,11px)', fontWeight: 700, letterSpacing: '0.2em' }}
          >
            Premium Accessories
          </p>
          <p
            className="text-white"
            style={{
              fontWeight: 500,
              fontSize: 'clamp(16px,1.35vw,22px)',
              lineHeight: 1.45,
              textShadow,
            }}
          >
            Because your car
            <br />
            deserves more than
            <br />
            stock
          </p>
        </div>

        {/* RIGHT panel — slides in from right */}
        <div
          ref={rightRef}
          className={`absolute right-[5%] top-1/2 -translate-y-1/2 z-20 text-right max-w-[360px] font-sans`}
          style={{ willChange: 'transform, opacity' }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: 'clamp(40px,4vw,68px)',
              color: '#8CC63F',
              letterSpacing: '-0.02em',
              lineHeight: 1.0,
              textShadow,
            }}
          >
            Upgrade
            <br />
            Your Drive.
          </div>
          <p
            className="text-white/70 mt-3"
            style={{
              fontWeight: 400,
              fontSize: 'clamp(13px,1.1vw,17px)',
              lineHeight: 1.6,
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            Precision-engineered parts built
            <br />
            for performance &amp; durability.
          </p>
        </div>

        {/* CTA — fades up near end of scroll */}
        <div
          ref={ctaRef}
          className={`absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 font-sans`}
          style={{ willChange: 'opacity, transform' }}
        >
          <Link href="/shop">
            <button
              type="button"
              className="px-10 py-4 rounded-full text-black font-bold uppercase transition-transform hover:scale-105 active:scale-95"
              style={{
                background: '#8CC63F',
                fontSize: 'clamp(11px,0.95vw,13px)',
                letterSpacing: '0.15em',
                boxShadow: '0 8px 32px rgba(140,198,63,0.35)',
              }}
            >
              Shop Now
            </button>
          </Link>
          <span
            className="text-white/35 text-xs uppercase"
            style={{ fontWeight: 500, letterSpacing: '0.18em' }}
          >
            Free next-day shipping on orders over ₹100
          </span>
        </div>

      </div>
    </section>
  );
}
