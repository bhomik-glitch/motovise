import styles from "./CredibilitySection.module.css";
import { VideoPlayer } from "./VideoPlayer";

export interface CredibilitySectionProps {
  eyebrow: string;
  quote: string;
  author: string;
  role: string;
  indicators: readonly string[];
}

export function CredibilitySection({
  eyebrow,
  quote,
  author,
  role,
  indicators
}: Readonly<CredibilitySectionProps>) {
  return (
    <section className="section">
      <div className="container">
        <div className={styles.layout}>
          <div className={`${styles.quoteCard} fadeIn`.trim()}>
            <span className="eyebrow">{eyebrow}</span>
            <blockquote>{quote}</blockquote>
            <div className={styles.authorBlock}>
              <strong>{author}</strong>
              <span>{role}</span>
            </div>
          </div>
          <div className={styles.support}>
            <div className={`${styles.visual} fadeIn`.trim()} aria-hidden="true">
              <VideoPlayer src="/car-scene.mp4" className={styles.videoBg} />
            </div>
            <div className={`${styles.indicators} fadeIn`.trim()}>
              {indicators.map((indicator) => (
                <div className={styles.indicator} key={indicator}>
                  <span />
                  <p>{indicator}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
