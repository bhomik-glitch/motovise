import styles from "./SectionIntro.module.css";

export interface SectionIntroProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left"
}: Readonly<SectionIntroProps>) {
  const wrapClassName = `${styles.wrap} ${align === "center" ? styles.center : ""}`.trim();

  return (
    <div className={wrapClassName}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
