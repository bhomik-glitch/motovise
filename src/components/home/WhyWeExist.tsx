'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './WhyWeExist.module.css';

gsap.registerPlugin(ScrollTrigger);

import { ScrollReveal } from '@/components/ui/ScrollReveal';

export interface WhyWeExistProps {
  eyebrow: string;
  intro: string;
  fragments: readonly string[];
  images?: readonly string[];
}

export function WhyWeExist({
  eyebrow,
  intro,
  fragments,
  images = [],
}: Readonly<WhyWeExistProps>) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const motionRefs = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const speeds = [24, 16, 28, 20, 26];
    const ctx = gsap.context(() => {
      motionRefs.current.forEach((element, index) => {
        if (!element) return;

        gsap.set(element, { '--parallax-y': '0px', '--drift-y': '0px' });

        gsap.to(element, {
          '--parallax-y': `${-speeds[index]}px`,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });

        gsap.fromTo(
          element,
          { '--drift-y': `${index % 2 === 0 ? -4 : -8}px` },
          {
            '--drift-y': `${index % 2 === 0 ? 8 : 10}px`,
            duration: 3.8 + index * 0.35,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          }
        );
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section className="hp-section relative z-10" id="why" ref={sectionRef}>
      <div className="absolute inset-0 z-[-1] pointer-events-none bg-gradient-to-b from-transparent to-[var(--color-surface)]/20" />
      <div className="hp-container">
        <div className={styles.layout}>
          <div className={`${styles.copy} py-24`}>
            <ScrollReveal>
              <span className="text-[var(--color-accent)] font-bold uppercase tracking-widest text-xs mb-8 block">{eyebrow}</span>
              <p className="text-3xl md:text-5xl font-medium text-[var(--color-text-inverse)] leading-tight">{intro}</p>
            </ScrollReveal>
          </div>
          <div className={styles.collage}>
            <div
              className={`${styles.motionTarget} ${styles.tile} ${styles.tileLarge}`.trim()}
              ref={(node) => {
                if (node) motionRefs.current[0] = node;
              }}
            >
              <ScrollReveal delay={0.1}>
                <span>01</span>
                <p>{fragments[0]}</p>
              </ScrollReveal>
            </div>
            <div
              aria-hidden="true"
              className={`${styles.motionTarget} ${styles.imageTile}`.trim()}
              ref={(node) => {
                if (node) motionRefs.current[1] = node;
              }}
            >
              {images[0] && <img src={images[0]} alt="" className={styles.fullImage} />}
            </div>
            <div
              className={`${styles.motionTarget} ${styles.tile}`.trim()}
              ref={(node) => {
                if (node) motionRefs.current[2] = node;
              }}
            >
              <ScrollReveal delay={0.2}>
                <span>02</span>
                <p>{fragments[1]}</p>
              </ScrollReveal>
            </div>
            <div
              className={`${styles.motionTarget} ${styles.tile} ${styles.offset}`.trim()}
              ref={(node) => {
                if (node) motionRefs.current[3] = node;
              }}
            >
              <ScrollReveal delay={0.3}>
                <span>03</span>
                <p>{fragments[2]}</p>
              </ScrollReveal>
            </div>
            <div
              aria-hidden="true"
              className={`${styles.motionTarget} ${styles.imageTile} ${styles.imageWarm}`.trim()}
              ref={(node) => {
                if (node) motionRefs.current[4] = node;
              }}
            >
              {images[1] && <img src={images[1]} alt="" className={styles.fullImage} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
