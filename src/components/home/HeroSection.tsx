import Link from 'next/link';
import styles from './HeroSection.module.css';

export interface HeroSectionProps {
  sideLabel: string;
  title: string;
  description: string;
  ctaLabel: string;
  microTop: string;
  microBottom: string;
}

import { StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal';

export function HeroSection({
  sideLabel,
  title,
  description,
  ctaLabel,
  microTop,
  microBottom,
}: Readonly<HeroSectionProps>) {
  return (
    <section className={`${styles.section} relative overflow-hidden`} id="top">
      
      <div className={`${styles.hero} relative z-0`.trim()}>
        <video className={styles.heroMedia} autoPlay loop muted playsInline>
          <source src="/videos/bmw-m3.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay} aria-hidden="true" />
        
        <div className={styles.heroInner}>
          <span className={styles.sideLabel}>AERODYNAMICS</span>
          
          <StaggerContainer className={styles.heroContent}>
            <StaggerItem>
              <span className="hp-eyebrow tracking-[0.2em] font-bold text-xs" style={{ color: 'var(--color-accent)' }}>PREMIUM AUTOMOTIVE INTERFACE</span>
            </StaggerItem>
            
            <StaggerItem>
              <h1 className={styles.heroTitle}>{title}</h1>
            </StaggerItem>
            
            <StaggerItem>
              <p className={styles.heroSub}>{description}</p>
            </StaggerItem>
            
            <StaggerItem className={`${styles.ctaGroup} flex gap-4 mt-8`}>
              <Link href="/products">
                <button 
                  className="bg-[var(--color-accent)] text-black font-bold uppercase tracking-widest px-8 py-4 rounded-full shadow-[0_0_20px_rgba(124,156,245,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:bg-white hover:-translate-y-1 transition-all duration-300 active:scale-95" 
                  type="button"
                >
                  {ctaLabel}
                </button>
              </Link>
              <Link href="#shop">
                <button 
                  className="border border-[var(--color-border)] bg-transparent text-[var(--color-text-inverse)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-surface)] uppercase font-bold tracking-widest px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-1 active:scale-95" 
                  type="button"
                >
                  View Products
                </button>
              </Link>
            </StaggerItem>
          </StaggerContainer>
          
          <div className={styles.microCopy}>
            <StaggerContainer delay={0.8}>
              <StaggerItem>
                <span>{microTop}</span>
              </StaggerItem>
              <StaggerItem>
                <span>{microBottom}</span>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
