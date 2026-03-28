"use client";

import { useState } from "react";
import type { FaqItem } from "@/data/landingContent";
import Link from "next/link";
import { Plus, Minus, ArrowRight } from "lucide-react";
import styles from "./FaqSection.module.css";

export interface FaqSectionProps {
  eyebrow: string;
  title: string;
  items: readonly FaqItem[];
}

export function FaqSection({
  eyebrow,
  title,
  items
}: Readonly<FaqSectionProps>) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section" id="faq" style={{ scrollMarginTop: "68px" }}>
      <div className={`container ${styles.grid}`}>
        {/* Left Side: Editorial Info */}
        <div className={styles.infoCol}>
          <span className="eyebrow">{eyebrow}</span>
          <h2 className={styles.headline}>Installation & Compatibility</h2>
          <p className={styles.subtext}>{title}</p>
          <Link href="/faq" className={styles.ctaLink}>
            <button className={styles.ctaButton}>
              <span>View All FAQs</span>
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>

        {/* Right Side: Clean Accordion */}
        <div className={styles.faqCol}>
          <div className={styles.list}>
            {items.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <article className={styles.item} key={item.question}>
                  <button
                    aria-expanded={isOpen}
                    className={styles.trigger}
                    onClick={() => toggle(index)}
                    type="button"
                  >
                    <span className={styles.questionText}>{item.question}</span>
                    <div className={`${styles.iconBox} ${isOpen ? styles.iconBoxOpen : ""}`.trim()}>
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </div>
                  </button>
                  <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`.trim()}>
                    <div className={styles.panelInner}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
