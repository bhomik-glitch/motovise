"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./FormulaStrip.module.css";

export interface FormulaStripProps {
  title: string;
  subtitle: string;
  items: readonly string[];
}

export function FormulaStrip({
  title,
  subtitle,
  items
}: Readonly<FormulaStripProps>) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const marqueeItems = [...items, ...items];

  useLayoutEffect(() => {
    if (!trackRef.current) {
      return;
    }

    const tween = gsap.to(trackRef.current, {
      xPercent: -50,
      duration: 20,
      ease: "linear",
      repeat: -1
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={`${styles.strip} surface fadeIn`.trim()}>
          <div className={styles.head}>
            <span className={styles.title}>{title}</span>
            <span className={styles.subtitle}>{subtitle}</span>
          </div>
          <div className={styles.marquee}>
            <div className={styles.track} ref={trackRef}>
              {marqueeItems.map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
