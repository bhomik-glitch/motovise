import type { ComparisonRow } from "@/data/landingContent";
import Link from "next/link";
import { Check, X, ArrowUpRight } from "lucide-react";
import styles from "./ComparisonTable.module.css";

export interface ComparisonTableProps {
  eyebrow: string;
  title: string;
  rows: readonly ComparisonRow[];
}

export function ComparisonTable({
  eyebrow,
  title,
  rows
}: Readonly<ComparisonTableProps>) {
  return (
    <section className={styles.sectionWrapper}>
      {/* Cinematic Environmental Layers (Full Width) */}
      <div className={styles.blockBg} />
      <div className={styles.blockOverlay} />

      <div className={styles.sectionContainer}>
        <div className={styles.block}>
          <div className={styles.content}>
            {/* Linked Heading & CTA */}
            <header className={styles.header}>
              <span className={styles.eyebrow}>{eyebrow}</span>
              <h2 className={styles.headline}>Built to outperform. Proven in real conditions.</h2>
              <p className={styles.subtext}>{title}</p>
              
              <div className={styles.ctaWrapper}>
                <Link href="/products" className={styles.ctaLink}>
                  <button className={styles.ctaButton}>
                    <span>Explore Products</span>
                    <ArrowUpRight size={16} strokeWidth={2.5} />
                  </button>
                </Link>
              </div>
            </header>

            {/* Floating Comparison Table */}
            <div className={`${styles.glassCard} fadeIn`.trim()}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col" className={styles.measureCol}>Performance Metric</th>
                    <th scope="col" className={styles.motoviseCol}>Motovise</th>
                    <th scope="col" className={styles.othersCol}>Generic Brands</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      <th scope="row" className={styles.rowLabel}>{row.label}</th>
                      <td className={styles.motoviseCell}>
                        <div className={styles.cellContent}>
                          <Check className={styles.checkIcon} size={18} />
                          <span>{row.sip}</span>
                        </div>
                      </td>
                      <td className={styles.othersCell}>
                        <div className={styles.cellContent}>
                          <X className={styles.xIcon} size={18} />
                          <span>{row.drip}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
