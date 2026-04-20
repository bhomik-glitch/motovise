'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap/dist/gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
const FRAME_COUNT = 240;
const CACHE_VERSION = 'v2';

const getFrameSrc = (index: number) => {
  const padded = String(index).padStart(3, '0');
  return `/api/top-frame/ezgif-frame-${padded}.jpg?v=${CACHE_VERSION}`;
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

export default function FrameScrollPlayer() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastFrameRef = useRef(-1);

  const [isReady, setIsReady] = useState(false);

  // Preload all frames; draw frame 0 once it's available
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

  // GSAP ScrollTrigger — no manual scroll listeners
  useEffect(() => {
    if (!isReady) return;

    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

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

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        renderFrame(self.progress);

        if (wrapperRef.current) {
          const scale = 1 + self.progress * 0.05;
          wrapperRef.current.style.transform = `scale(${scale})`;
        }

        if (textRef.current) {
          const opacity = Math.max(0, 1 - self.progress * 2.8);
          textRef.current.style.opacity = String(opacity);
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

  const textShadow = '0 4px 16px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.25)';

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: '200vh' }}
      aria-label="Motovise cinematic hero"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Canvas wrapper — scale driven by GSAP */}
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

        {/* Vignette — dark edges for cinematic depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.58) 100%)',
          }}
        />

        {/* Top-left lighting highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 48%)',
          }}
        />

        {/* Bottom gradient fade */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(238,242,255,0.65) 0%, transparent 38%)',
          }}
        />

        {/* Text overlay — fades out on scroll via GSAP */}
        <div
          ref={textRef}
          className="absolute inset-0 pointer-events-none"
          style={{ willChange: 'opacity' }}
        >
          {/* Desktop left */}
          <motion.p
            className={`hidden md:block absolute left-[6%] top-1/2 -translate-y-1/2 z-20 text-white font-sans`}
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
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

          {/* Desktop right */}
          <div
            className={`hidden md:block absolute right-[6%] top-1/2 -translate-y-1/2 z-20 text-right max-w-[620px] font-sans`}
          >
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
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
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
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

          {/* Mobile */}
          <div
            className={`md:hidden absolute top-14 left-1/2 -translate-x-1/2 z-20 w-[92%] text-center font-sans`}
          >
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
      </div>
    </section>
  );
}
