import styles from "./QuotePaymentInfo.module.css";

// "IT60X0542811101000000123456" -> "IT60 X054 2811 1010 0000 0123 456"
function formatIban(iban: string): string {
  return iban.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}

interface QuotePaymentInfoProps {
  paymentMethod: string | null | undefined;
  paymentTerms: string | null | undefined;
  iban: string | null | undefined;
}

/** Metodo, termini di pagamento e IBAN. Non rende nulla se mancano tutti. */
export function QuotePaymentInfo({
  paymentMethod,
  paymentTerms,
  iban,
}: QuotePaymentInfoProps) {
  const hasPayment = !!paymentMethod || !!paymentTerms || !!iban;
  if (!hasPayment) return null;

  return (
    <section className={styles.paymentSection}>
      <strong>Pagamento</strong>
      {paymentMethod && <p>Metodo: {paymentMethod}</p>}
      {paymentTerms && <p>{paymentTerms}</p>}
      {iban && <p className={styles.iban}>IBAN {formatIban(iban)}</p>}
    </section>
  );
}
