'use client';

import { useState } from 'react';
import { SectionIntro } from './SectionIntro';
import styles from './FaqSection.module.css';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionProps {
  eyebrow: string;
  title: string;
  items: readonly FaqItem[];
}

export function FaqSection({
  eyebrow,
  title,
  items,
}: Readonly<FaqSectionProps>) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="hp-section relative z-10" id="faq">
      <div className="hp-container">
        <ScrollReveal>
          <SectionIntro eyebrow={eyebrow} title={title} align="center" />
        </ScrollReveal>
        <StaggerContainer className={`${styles.list} max-w-3xl mx-auto`}>
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <StaggerItem key={item.question}>
                <article
                  className={`${styles.item} border-b border-[var(--color-border)] last:border-b-0 hover:bg-white/5 transition-colors overflow-hidden`.trim()}
                >
                  <button
                    aria-expanded={isOpen}
                    className={`${styles.trigger} text-left py-6 px-4 flex justify-between items-center w-full focus:outline-none`}
                    onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
                    type="button"
                  >
                    <span className="font-bold text-lg text-[var(--color-text-inverse)] group-hover:text-[var(--color-accent)] transition-colors">{item.question}</span>
                    <span className="text-[var(--color-accent)] text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    className={`${styles.panel} ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} px-4 overflow-hidden transition-all duration-300 ease-in-out`.trim()}
                  >
                    <p className="pb-6 text-[var(--color-text-muted)] text-base leading-relaxed">{item.answer}</p>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
