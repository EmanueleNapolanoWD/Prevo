import type { QuoteItem } from "@/types/quote";
import { calcLineTotal } from "@/lib/utils";

import { QuoteSectionTitle } from "./QuoteSectionTitle";
import styles from "./QuoteItemsTable.module.css";

interface QuoteItemsTableProps {
  items: QuoteItem[];
  money: Intl.NumberFormat;
}

/** Dettaglio delle voci del preventivo. */
export function QuoteItemsTable({ items, money }: QuoteItemsTableProps) {
  return (
    <section className={styles.itemsSection}>
      <QuoteSectionTitle>Dettaglio del preventivo</QuoteSectionTitle>

      {items.length === 0 ? (
        <p className={styles.placeholder}>
          Le voci aggiunte al preventivo appariranno qui.
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Descrizione</th>
              <th className={styles.num}>Qtà</th>
              <th className={styles.num}>Prezzo</th>
              <th className={styles.num}>Sconto</th>
              <th className={styles.num}>Importo</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const hasDiscount = item.discount_value > 0;

              return (
                <tr key={item.id}>
                  <td>
                    <span className={styles.itemName}>{item.name}</span>
                    {item.description && (
                      <span className={styles.itemDesc}>
                        {item.description}
                      </span>
                    )}
                  </td>
                  <td className={styles.num}>
                    {item.quantity} {item.unit}
                  </td>
                  <td className={styles.num}>
                    {money.format(item.unit_price)}
                  </td>
                  <td className={styles.num}>
                    {hasDiscount
                      ? item.discount_type === "percentage"
                        ? `${item.discount_value}%`
                        : money.format(item.discount_value)
                      : "—"}
                  </td>
                  <td className={styles.num}>
                    {money.format(calcLineTotal(item))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
