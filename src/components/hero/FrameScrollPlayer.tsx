'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FrameScrollPlayer() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: '100vh', minHeight: 640 }}
      aria-label="Motovise hero"
    >
      {/* ── Video background ── */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/hero-section-video.mp4" type="video/mp4" />
      </video>

      {/* Dark + blue-tinted overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(0,8,24,0.78) 0%, rgba(0,20,60,0.52) 50%, rgba(0,8,24,0.72) 100%)',
        }}
      />

      {/* Electric-blue radial glow (right side, where brand name sits) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 72% 48%, rgba(0,110,255,0.14) 0%, transparent 58%)',
        }}
      />

      {/* Bottom vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,6,20,0.85) 0%, transparent 42%)',
        }}
      />

      {/* ── Content layer ── */}
      <div className="relative h-full flex items-center z-10">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-14 flex items-center justify-between">

          {/* ── Left: tagline (desktop) ── */}
          <motion.p
            className="hidden md:block font-sans"
            initial={{ x: -56, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontWeight: 400,
              fontSize: 'clamp(17px, 1.35vw, 23px)',
              lineHeight: 1.65,
              maxWidth: 300,
              color: 'rgba(170, 210, 255, 0.82)',
              textShadow: '0 2px 10px rgba(0,0,0,0.65)',
            }}
          >
            Because your car
            <br />
            deserves more than
            <br />
            stock
          </motion.p>

          {/* ── Right: brand + CTA (desktop) ── */}
          <div className="hidden md:flex flex-col items-end text-right">

            {/* Eyebrow */}
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
              style={{
                fontSize: 'clamp(10px, 0.9vw, 13px)',
                color: 'rgba(100, 180, 255, 0.65)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                marginBottom: 10,
              }}
            >
              Premium Automotive Accessories
            </motion.span>

            {/* Brand name — electric blue with glow */}
            <motion.div
              initial={{ x: 64, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontWeight: 900,
                fontSize: 'clamp(52px, 5.2vw, 84px)',
                color: '#3B9EFF',
                letterSpacing: '-0.025em',
                lineHeight: 1,
                textShadow:
                  '0 0 48px rgba(59,158,255,0.55), 0 0 16px rgba(59,158,255,0.3), 0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              Motovise
            </motion.div>

            {/* Sub-headline */}
            <motion.div
              initial={{ x: 64, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3"
              style={{
                fontWeight: 500,
                fontSize: 'clamp(22px, 2.1vw, 38px)',
                color: 'rgba(220, 235, 255, 0.92)',
                textShadow: '0 2px 14px rgba(0,0,0,0.55)',
              }}
            >
              Give Your Car Wings
            </motion.div>

            {/* Description line */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: 'easeOut' }}
              className="mt-4"
              style={{
                fontSize: 'clamp(13px, 1vw, 16px)',
                color: 'rgba(130, 185, 255, 0.6)',
                maxWidth: 420,
                lineHeight: 1.6,
              }}
            >
              Precision-engineered add-ons that transform how your vehicle looks, feels, and performs on every road.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7, ease: 'easeOut' }}
              className="flex gap-4 mt-8"
            >
              <Link href="/products">
                <motion.button
                  type="button"
                  className="px-9 py-4 font-bold uppercase tracking-widest rounded-full text-white text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #0057E0 0%, #0EA5E9 100%)',
                    boxShadow: '0 0 28px rgba(0,110,255,0.55), 0 4px 14px rgba(0,0,0,0.35)',
                  }}
                  whileHover={{
                    scale: 1.06,
                    boxShadow: '0 0 48px rgba(0,150,255,0.75), 0 4px 18px rgba(0,0,0,0.4)',
                  }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  Shop Now
                </motion.button>
              </Link>

              <Link href="#shop">
                <motion.button
                  type="button"
                  className="px-9 py-4 font-bold uppercase tracking-widest rounded-full text-sm"
                  style={{
                    border: '1px solid rgba(59,158,255,0.38)',
                    background: 'rgba(0,50,160,0.18)',
                    color: 'rgba(160, 210, 255, 0.92)',
                    backdropFilter: 'blur(6px)',
                  }}
                  whileHover={{
                    scale: 1.06,
                    borderColor: 'rgba(59,158,255,0.75)',
                    background: 'rgba(0,70,200,0.28)',
                  }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  View Products
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* ── Mobile layout ── */}
          <div className="md:hidden w-full flex flex-col items-center text-center pt-12">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontSize: 11,
                color: 'rgba(100, 180, 255, 0.6)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                marginBottom: 12,
              }}
            >
              Premium Automotive Accessories
            </motion.span>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontWeight: 900,
                fontSize: 'clamp(46px, 13vw, 68px)',
                color: '#3B9EFF',
                letterSpacing: '-0.025em',
                lineHeight: 1,
                textShadow:
                  '0 0 40px rgba(59,158,255,0.55), 0 0 14px rgba(59,158,255,0.3)',
              }}
            >
              Motovise
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3"
              style={{
                fontWeight: 500,
                fontSize: 'clamp(20px, 5.5vw, 30px)',
                color: 'rgba(220, 235, 255, 0.9)',
              }}
            >
              Give Your Car Wings
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-3 px-4"
              style={{
                fontSize: 'clamp(13px, 3.8vw, 16px)',
                color: 'rgba(170, 210, 255, 0.7)',
                lineHeight: 1.6,
                maxWidth: 320,
              }}
            >
              Because your car deserves more than stock
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="flex gap-3 mt-8"
            >
              <Link href="/products">
                <motion.button
                  type="button"
                  className="px-7 py-3.5 font-bold uppercase tracking-widest rounded-full text-white text-xs"
                  style={{
                    background: 'linear-gradient(135deg, #0057E0, #0EA5E9)',
                    boxShadow: '0 0 24px rgba(0,110,255,0.5)',
                  }}
                  whileTap={{ scale: 0.96 }}
                >
                  Shop Now
                </motion.button>
              </Link>

              <Link href="#shop">
                <motion.button
                  type="button"
                  className="px-7 py-3.5 font-bold uppercase tracking-widest rounded-full text-xs"
                  style={{
                    border: '1px solid rgba(59,158,255,0.4)',
                    background: 'rgba(0,50,160,0.2)',
                    color: 'rgba(160,210,255,0.9)',
                    backdropFilter: 'blur(6px)',
                  }}
                  whileTap={{ scale: 0.96 }}
                >
                  Explore
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Subtle scan-line accent at the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(59,158,255,0.4) 30%, rgba(59,158,255,0.4) 70%, transparent)',
        }}
      />
    </section>
  );
}
