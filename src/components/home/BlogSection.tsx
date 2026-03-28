import { SectionIntro } from './SectionIntro';
import styles from './BlogSection.module.css';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal';

export interface BlogCard {
  category: string;
  title: string;
  excerpt: string;
  image: string;
}

export interface BlogSectionProps {
  eyebrow: string;
  title: string;
  cards: readonly BlogCard[];
}

export function BlogSection({
  eyebrow,
  title,
  cards,
}: Readonly<BlogSectionProps>) {
  return (
    <section className="hp-section relative z-10 overflow-hidden">
      <div className="absolute inset-0 z-[-1] bg-gradient-to-t from-[var(--color-bg)] to-transparent pointer-events-none" />
      <div className="hp-container">
        <ScrollReveal>
          <SectionIntro eyebrow={eyebrow} title={title} align="center" />
        </ScrollReveal>
        <StaggerContainer className={styles.grid}>
          {cards.map((card) => (
            <StaggerItem key={card.title}>
              <article className={`${styles.card} hover:-translate-y-2 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_40px_rgba(124,156,245,0.15)]`.trim()}>
                <div
                  className={styles.visual}
                  aria-hidden="true"
                  style={{
                    backgroundImage: `url(${card.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                <div className={styles.body}>
                  <span className="text-[var(--color-accent)] font-bold text-xs tracking-wider uppercase">{card.category}</span>
                  <h3 className="text-xl font-bold mt-2 mb-3 text-[var(--color-text-inverse)]">{card.title}</h3>
                  <p className="text-[var(--color-text-muted)] line-clamp-3 mb-6">{card.excerpt}</p>
                  <a href="#top" className="text-[var(--color-accent)] font-bold uppercase tracking-widest text-sm hover:text-white transition-colors relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-0 after:left-0 after:bg-white after:origin-bottom-right after:transition-transform hover:after:scale-x-100 hover:after:origin-bottom-left">Read more</a>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
