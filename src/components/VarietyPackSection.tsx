"use client";

import { useEffect } from "react";
import { SectionIntro } from "./SectionIntro";
import styles from "./VarietyPackSection.module.css";

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
  includedItems: initialItems
}: Readonly<VarietyPackSectionProps>) {

  useEffect(() => {
    console.log("VarietyPackSection mounted");
  }, []);

  return (
    <section className="section" id="starter-bundle" style={{ scrollMarginTop: "68px" }}>
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.visual}>
            <div className={styles.visualBadge}>BUNDLE OFFER</div>
          </div>
          <div className={styles.copy}>
            <SectionIntro eyebrow={eyebrow} title={title} description={description} />
            <div className={styles.list}>
              {initialItems.map((item, idx) => (
                <div key={idx} className={styles.listItem}>
                  <span>{item}</span>
                  <span>QTY: 01</span>
                </div>
              ))}
            </div>
            <div className={styles.cta}>
              <div className={styles.priceInfo}>
                <span className={styles.bundlePrice}>$289.00</span>
                <span className={styles.savingsLabel}>SAVE $60 ON STARTER PACK</span>
              </div>
              <button className={styles.bundleButton}>Claim Special Bundle</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
