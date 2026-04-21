import styles from './CredibilitySection.module.css';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal';

export interface CredibilitySectionProps {
  eyebrow: string;
  quote: string;
  author: string;
  role: string;
  indicators: readonly string[];
}

export function CredibilitySection({
  eyebrow,
  quote,
  author,
  role,
  indicators,
}: Readonly<CredibilitySectionProps>) {
  return (
    <section className="hp-section relative z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent opacity-50" />
      <div className="hp-container">
        <StaggerContainer className={styles.layout}>
          <StaggerItem className={`${styles.quoteCard} bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-10 lg:p-14 shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative`.trim()}>
            <span className="text-[var(--color-accent)] font-bold uppercase tracking-widest text-xs mb-8 block">{eyebrow}</span>
            <blockquote className="text-2xl lg:text-3xl font-medium text-[var(--color-text-inverse)] leading-snug mb-10">&quot;{quote}&quot;</blockquote>
            <div className={`${styles.authorBlock} flex flex-col gap-1`}>
              <strong className="text-lg text-[var(--color-text-inverse)]">{author}</strong>
              <span className="text-[var(--color-text-muted)]">{role}</span>
            </div>
          </StaggerItem>
          <div className={`${styles.support} flex flex-col justify-between gap-8 py-4`}>
            <StaggerItem className={`${styles.visual} h-64 rounded-2xl border border-[var(--color-border)] shadow-inner relative overflow-hidden`.trim()} aria-hidden="true">
              <video
                src="/car-scene.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />
            </StaggerItem>
            <StaggerContainer className={`${styles.indicators} grid grid-cols-2 gap-6`.trim()}>
              {indicators.map((indicator) => (
                <StaggerItem className={`${styles.indicator} flex items-center gap-4`} key={indicator}>
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]" />
                  <p className="text-[var(--color-text-inverse)] font-medium text-sm">{indicator}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </StaggerContainer>
      </div>
    </section>
  );
}
