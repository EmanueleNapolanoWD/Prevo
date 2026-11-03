import styles from "./QuoteTitleBlock.module.css";

interface QuoteTitleBlockProps {
  title: string | null | undefined;
  description: string | null | undefined;
}

/** Titolo e descrizione del preventivo. */
export function QuoteTitleBlock({ title, description }: QuoteTitleBlockProps) {
  return (
    <section className={styles.titleBlock}>
      <h2 className={!title ? styles.muted : undefined}>
        {title || "Titolo del preventivo"}
      </h2>
      {description && <p className={styles.description}>{description}</p>}
    </section>
  );
}
