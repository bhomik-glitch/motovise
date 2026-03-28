"use client";

import type { BlogCard } from "@/data/landingContent";
import { SectionIntro } from "./SectionIntro";
import styles from "./BlogSection.module.css";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export interface BlogSectionProps {
  eyebrow: string;
  title: string;
  cards: readonly BlogCard[];
}

export function BlogSection({
  eyebrow,
  title,
  cards
}: Readonly<BlogSectionProps>) {
  return (
    <section id="garage-notes" className="section bg-slate-950 py-24 relative overflow-hidden">
      {/* Subtle Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="container relative z-10">
        <SectionIntro eyebrow={eyebrow} title={title} />
        
        <div className={styles.grid}>
          {cards.map((card, index) => (
            <article 
              className={styles.card} 
              key={card.title}
              style={{ "--index": index } as React.CSSProperties}
            >
              <div 
                 className={styles.visual} 
                 style={{ 
                   backgroundImage: `url(${card.image})`
                 }} 
              />
              <div className={styles.overlay} />
              
              <div className={styles.body}>
                <span className={styles.category}>{card.category}</span>
                <h3 className={styles.title}>{card.title}</h3>
                <p className={styles.excerpt}>{card.excerpt}</p>
                <Link href="#top" className={styles.readMore}>
                  <span>Explore Guide</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Global CTA */}
        <div className={styles.footer}>
          <Link href="/guides" className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all duration-300 group">
            <span>View all articles</span>
            <ArrowRight size={18} className="translate-y-[-1px] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
