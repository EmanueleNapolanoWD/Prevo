import styles from "./QuoteTotals.module.css";

interface QuoteTotalsProps {
  subtotal: number;
  vat: number;
  total: number;
  vatRate: number;
  surcharge: number;
  money: Intl.NumberFormat;
}

/** Riepilogo importi. I valori arrivano già calcolati: nessun ricalcolo qui. */
export function QuoteTotals({
  subtotal,
  vat,
  total,
  vatRate,
  surcharge,
  money,
}: QuoteTotalsProps) {
  return (
    <section className={styles.totalsSection}>
      <dl className={styles.totals}>
        <div>
          <dt>Imponibile</dt>
          <dd>{money.format(subtotal)}</dd>
        </div>
        {surcharge !== 0 && (
          <div>
            <dt>Maggiorazione</dt>
            <dd>{money.format(surcharge)}</dd>
          </div>
        )}
        <div>
          <dt>IVA ({vatRate}%)</dt>
          <dd>{money.format(vat)}</dd>
        </div>
        <div className={styles.grandTotal}>
          <dt>Totale</dt>
          <dd>{money.format(total)}</dd>
        </div>
      </dl>
    </section>
  );
}
