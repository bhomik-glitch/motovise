import Link from "next/link";
import styles from "./HeroSection.module.css";
import { ArrowUpRight } from "lucide-react";
// Playfair Display removed to use Montserrat as the main font

export interface HeroSectionProps {
  sideLabel: string;
  title: string;
  description: string;
  ctaLabel: string;
  microTop: string;
  microBottom: string;
}

export function HeroSection({
  sideLabel,
  title,
  description,
  ctaLabel,
  microTop,
  microBottom
}: Readonly<HeroSectionProps>) {
  return (
    <section className={styles.section} id="top">
      <div className={`${styles.hero} fadeIn`.trim()}>
        <video className={styles.heroMedia} autoPlay loop muted playsInline>
          <source src="/videos/bmw-m3.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroInner}>
          <span className={styles.sideLabel}>{sideLabel}</span>
          <div className={styles.heroContent}>
            <span className="eyebrow">Primary Focus</span>
            <h1 className={styles.heroTitle}>{title}</h1>
            <p className={styles.heroSub}>{description}</p>
            <Link href="/products/playbox-max">
              <button className={styles.heroCTA} type="button">
                <span>{ctaLabel}</span>
                <ArrowUpRight size={18} strokeWidth={2.5} className={styles.ctaIcon} />
              </button>
            </Link>
          </div>
          <div className={styles.microCopy}>
            <span>{microTop}</span>
            <span>{microBottom}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
