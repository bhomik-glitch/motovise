import styles from "./CredibilitySection.module.css";

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
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className={styles.videoBg}
            >
              <source src="/car-scene.mp4" type="video/mp4" />
            </video>
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
