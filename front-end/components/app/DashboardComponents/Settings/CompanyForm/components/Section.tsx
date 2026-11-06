import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import styles from "../companyform.module.css";

type SectionProps = {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function Section({
  id,
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
}: SectionProps) {
  return (
    <section id={id} className={styles.card} aria-labelledby={`${id}-title`}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionIcon}>
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>
      </div>
      <div className={styles.grid}>{children}</div>
    </section>
  );
}