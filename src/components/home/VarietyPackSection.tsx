import { SectionIntro } from './SectionIntro';
import styles from './VarietyPackSection.module.css';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal';

export interface VarietyPackSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  includedItems: readonly string[];
}

export function VarietyPackSection({
  eyebrow,
  title,
  description,
  includedItems,
}: Readonly<VarietyPackSectionProps>) {
  return (
    <section className="hp-section relative overflow-hidden z-10" id="starter-bundle">
      <div className="absolute inset-0 z-[-1] bg-gradient-to-r from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)] opacity-50 pointer-events-none" />
      <div className="hp-container">
        <StaggerContainer className={styles.layout}>
          <StaggerItem className={`${styles.visual} relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[var(--color-border)]`}>
            <img src="/pack.avif" alt="Starter Pack" className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
            <div className={`${styles.visualBadge} absolute top-6 left-6 bg-[var(--color-accent)] text-black font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-full shadow-[0_0_20px_rgba(124,156,245,0.4)] blur-0 backdrop-blur-none`}>
              BUNDLE OFFER
            </div>
          </StaggerItem>
          <StaggerItem className={`${styles.copy} p-8 lg:p-12 relative flex flex-col justify-center`}>
            <SectionIntro
              eyebrow={eyebrow}
              title={title}
              description={description}
            />
            <div className={`${styles.list} mt-8 border-y border-[var(--color-border)] py-6 space-y-4`}>
              {includedItems.map((item, idx) => (
                <div key={idx} className={`${styles.listItem} flex justify-between text-lg text-[var(--color-text-inverse)]`}>
                  <span>{item}</span>
                  <span className="text-[var(--color-text-muted)] font-mono text-sm tracking-widest">QTY: 01</span>
                </div>
              ))}
            </div>
            <ScrollReveal className={`${styles.cta} mt-10 space-y-6`} delay={0.4}>
              <div className={`${styles.priceInfo} flex items-end gap-4`}>
                <span className={`${styles.bundlePrice} text-5xl font-bold tracking-tight text-[var(--color-text-inverse)]`}>$289.00</span>
                <span className={`${styles.savingsLabel} text-[var(--color-accent)] font-bold tracking-widest text-xs uppercase mb-2`}>SAVE $60 ON STARTER PACK</span>
              </div>
              <button className={`${styles.bundleButton} w-full bg-[var(--color-accent)] text-black font-bold uppercase tracking-widest px-8 py-5 rounded-full shadow-[0_0_20px_rgba(124,156,245,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:bg-white hover:-translate-y-1 transition-all duration-300 active:scale-95`}>
                Claim Special Bundle
              </button>
            </ScrollReveal>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
