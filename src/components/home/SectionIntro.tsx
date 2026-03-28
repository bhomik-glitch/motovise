import styles from './SectionIntro.module.css';
import { StaggerContainer, StaggerItem } from '@/components/ui/ScrollReveal';

export interface SectionIntroProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  align = 'left',
}: Readonly<SectionIntroProps>) {
  const wrapClassName = `${styles.wrap} ${align === 'center' ? styles.center : ''}`.trim();

  return (
    <StaggerContainer className={wrapClassName}>
      <StaggerItem>
        <span className="hp-eyebrow text-[var(--color-accent)]">{eyebrow}</span>
      </StaggerItem>
      <StaggerItem>
        <h2>{title}</h2>
      </StaggerItem>
      {description && (
        <StaggerItem>
          <p className="text-[var(--color-text-muted)]">{description}</p>
        </StaggerItem>
      )}
    </StaggerContainer>
  );
}
