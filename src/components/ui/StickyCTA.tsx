'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

export function StickyCTA() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [100, 0]);
  const opacity = useTransform(scrollY, [0, 500], [0, 1]);

  return (
    <motion.div 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 p-3 bg-black/80 backdrop-blur-xl border border-[var(--color-border)] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
      style={{ y, opacity }}
    >
      <div className="hidden sm:block px-4">
        <span className="text-sm font-bold text-[var(--color-text-inverse)] uppercase tracking-widest whitespace-nowrap">Motovise Pro Kit</span>
        <span className="text-xs text-[var(--color-text-muted)] block">Complete performance upgrade</span>
      </div>
      <a href="#shop" className="bg-[var(--color-accent)] hover:bg-white text-black text-sm font-bold uppercase tracking-widest px-8 py-3 rounded-full shadow-[0_0_20px_rgba(124,156,245,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
        Shop Now
      </a>
    </motion.div>
  );
}
