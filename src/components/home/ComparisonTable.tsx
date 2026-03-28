import { SectionIntro } from './SectionIntro';
import styles from './ComparisonTable.module.css';
import { ScrollReveal, StaggerContainer } from '@/components/ui/ScrollReveal';
import { motion } from 'framer-motion';

export interface ComparisonRow {
  label: string;
  sip: string;
  drip: string;
}

export interface ComparisonTableProps {
  eyebrow: string;
  title: string;
  rows: readonly ComparisonRow[];
}

export function ComparisonTable({
  eyebrow,
  title,
  rows,
}: Readonly<ComparisonTableProps>) {
  return (
    <section className="hp-section relative z-10 overflow-hidden">
      <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-transparent via-[var(--color-surface)]/20 to-transparent pointer-events-none" />
      <div className="hp-container">
        <ScrollReveal>
          <SectionIntro eyebrow={eyebrow} title={title} />
        </ScrollReveal>
        
        <StaggerContainer className={`${styles.tableWrap} border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.2)] bg-[var(--color-surface)]`.trim()}>
          <table className={styles.table}>
            <thead className="bg-[#1a1a1a] border-b border-[var(--color-border)]">
              <tr>
                <th scope="col" className="text-[var(--color-text-muted)] font-normal uppercase tracking-wider text-xs">Measure</th>
                <th scope="col" className="text-[var(--color-text-inverse)] font-bold text-lg">Motovise</th>
                <th scope="col" className="text-[var(--color-text-muted)] font-normal">Others</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr 
                  variants={{
                    hidden: { opacity: 0, y: 40 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }
                  }}
                  key={i} 
                  className="border-b border-[var(--color-border)] hover:bg-white/5 transition-colors"
                >
                  <th scope="row" className="font-medium text-[var(--color-text-inverse)] py-5">{row.label}</th>
                  <td className="text-[var(--color-accent)] font-bold">{row.sip}</td>
                  <td className="text-[var(--color-text-muted)] opacity-50">{row.drip}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </StaggerContainer>
      </div>
    </section>
  );
}
