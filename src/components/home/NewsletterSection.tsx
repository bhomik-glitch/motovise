import { SectionIntro } from './SectionIntro';
import styles from './NewsletterSection.module.css';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal';

export interface NewsletterSectionProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function NewsletterSection({
  eyebrow,
  title,
  description,
}: Readonly<NewsletterSectionProps>) {
  return (
    <section className="hp-section relative z-10 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[var(--color-surface)] z-[-1]" />
      <div className="hp-container">
        <ScrollReveal className={`${styles.panel} bg-gradient-to-br from-[#1a1c23] to-[#121318] border border-[var(--color-border)] rounded-3xl p-10 lg:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden`.trim()}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent)] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />
          <SectionIntro eyebrow={eyebrow} title={title} description={description} align="center" />
          <StaggerContainer className={`${styles.form} max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6`}>
            <StaggerItem className="lg:col-span-3">
              <label className="block">
                <span className="block text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-widest mb-2">First name</span>
                <input name="firstName" placeholder="Jane" type="text" className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-inverse)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all" />
              </label>
            </StaggerItem>
            <StaggerItem className="lg:col-span-3">
              <label className="block">
                <span className="block text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-widest mb-2">Last name</span>
                <input name="lastName" placeholder="Doe" type="text" className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-inverse)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all" />
              </label>
            </StaggerItem>
            <StaggerItem className={`${styles.emailField} lg:col-span-4 block`}>
              <label className="block">
                <span className="block text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-widest mb-2">Email</span>
                <input name="email" placeholder="jane.doe@example.com" type="email" className="w-full bg-black/40 border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text-inverse)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all" />
              </label>
            </StaggerItem>
            <StaggerItem className="lg:col-span-2 flex items-end">
              <button className="w-full bg-[var(--color-accent)] text-black font-bold uppercase tracking-widest text-xs px-6 py-4 rounded-lg shadow-[0_0_20px_rgba(124,156,245,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:bg-white hover:-translate-y-1 transition-all duration-300 active:scale-95" type="button">
                Subscribe
              </button>
            </StaggerItem>
          </StaggerContainer>
        </ScrollReveal>
      </div>
    </section>
  );
}
