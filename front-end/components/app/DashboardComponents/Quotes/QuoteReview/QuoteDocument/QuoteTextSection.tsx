import styles from "./QuoteTextSection.module.css";

interface QuoteTextSectionProps {
  title: string;
  text: string;
}

/** Blocco di testo libero con titolo: usato per "Note" e "Condizioni". */
export function QuoteTextSection({ title, text }: QuoteTextSectionProps) {
  return (
    <section className={styles.termsSection}>
      <strong>{title}</strong>
      <p>{text}</p>
    </section>
  );
}
