'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './FormulaStrip.module.css';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export interface FormulaStripProps {
  title: string;
  subtitle: string;
  items: readonly string[];
}

export function FormulaStrip({
  title,
  subtitle,
  items,
}: Readonly<FormulaStripProps>) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const marqueeItems = [...items, ...items];

  useLayoutEffect(() => {
    if (!trackRef.current) return;

    const tween = gsap.to(trackRef.current, {
      xPercent: -50,
      duration: 20,
      ease: 'linear',
      repeat: -1,
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <section className={`${styles.section} relative z-10 py-12 border-y border-[var(--color-border)] bg-[#111216] overflow-hidden`}>
      <div className="hp-container relative">
        <ScrollReveal>
          <div className={`${styles.strip} flex md:flex-row flex-col items-center gap-8 justify-between`.trim()}>
            <div className={`${styles.head} shrink-0 flex flex-col gap-1 pr-8 border-r-0 md:border-r border-[var(--color-border)]`}>
              <span className="font-bold text-[var(--color-text-inverse)] uppercase tracking-wider">{title}</span>
              <span className="text-[var(--color-accent)] font-mono text-sm tracking-widest">{subtitle}</span>
            </div>
            <div className={`${styles.marquee} flex-1 overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]`}>
              <div className={`${styles.track} flex items-center whitespace-nowrap gap-12`} ref={trackRef}>
                {marqueeItems.map((item, index) => (
                  <span className="text-[var(--color-text-muted)] font-medium text-lg tracking-wide uppercase" key={`${item}-${index}`}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
