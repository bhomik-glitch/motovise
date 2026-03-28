import { SectionIntro } from "./SectionIntro";
import styles from "./NewsletterSection.module.css";

export interface NewsletterSectionProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function NewsletterSection({
  eyebrow,
  title,
  description
}: Readonly<NewsletterSectionProps>) {
  return (
    <section className={styles.newsletterSection}>
      <div className="container">
        <div className={`${styles.panel} fadeIn`.trim()}>
          <SectionIntro 
            eyebrow={eyebrow} 
            title={title} 
            description={description} 
            align="center" 
          />
          <form className={styles.form}>
            <label>
              <span>First name</span>
              <input name="firstName" placeholder="First name" type="text" />
            </label>
            <label>
              <span>Last name</span>
              <input name="lastName" placeholder="Last name" type="text" />
            </label>
            <label className={styles.emailField}>
              <span>Email</span>
              <input name="email" placeholder="Email address" type="email" />
            </label>
            <button className={`${styles.submitButton} primaryButton`} type="button">
              Join newsletter
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
