"use client";

import type { CSSProperties } from "react";

import type {
  QuoteSettingsData,
  QuoteItem,
  QuoteAppearanceValues,
} from "@/types/quote";
import type {
  QuoteHeaderValues,
  TaxQuoteValue,
  QuoteContact,
} from "../hooks/useQuoteForm";
import type { ClientDetail } from "@/types/client";
import { calcLineTotal, parseNumber, type calcTotals } from "@/lib/utils";
import styles from "./QuotePreview.module.css";

type QuoteTotals = ReturnType<typeof calcTotals>;

interface QuotePreviewProps {
  settings: QuoteSettingsData | null;
  header: QuoteHeaderValues;
  tax: TaxQuoteValue;
  appearance: QuoteAppearanceValues;
  contact: QuoteContact;
  selectedClient: ClientDetail | null;
  items: QuoteItem[];
  totals: QuoteTotals | null;
  money: Intl.NumberFormat;
}

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("it-IT");
}

export function QuotePreview({
  settings,
  header,
  tax,
  appearance,
  contact,
  selectedClient,
  items,
  totals,
  money,
}: QuotePreviewProps) {
  const vatRate = parseNumber(tax.vat_rate);
  const surcharge = parseNumber(tax.surcharge);

  return (
    <div className={styles.previewWrapper}>
      <div
        className={`${styles.document} ${styles[appearance.template] ?? ""}`}
        style={
          {
            "--quote-primary": appearance.primaryColor,
            "--quote-accent": appearance.accentColor,
          } as CSSProperties
        }
      >
        {/* Intestazione */}
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>PREVENTIVO</span>
            <h2 className={!header.title ? styles.muted : undefined}>
              {header.title || "Titolo del preventivo"}
            </h2>
            <p className={styles.number}>N. {header.number || "—"}</p>
          </div>

          <div className={styles.company}>
            <strong>{settings?.company_name ?? "La tua azienda"}</strong>
          </div>
        </header>

        {header.description && (
          <section className={styles.description}>{header.description}</section>
        )}

        {/* Destinatario + validità */}
        <section className={styles.metaGrid}>
          <div className={styles.clientSection}>
            <h3>Destinatario</h3>
            <strong className={!selectedClient ? styles.muted : undefined}>
              {selectedClient?.display_name ?? "Seleziona un cliente"}
            </strong>
            {contact.address && <p>{contact.address}</p>}
            {contact.email && <p>{contact.email}</p>}
            {contact.phone && <p>{contact.phone}</p>}
          </div>

          {tax.valid_until && (
            <div className={styles.validity}>
              <h3>Valido fino al</h3>
              <strong>{formatDate(tax.valid_until)}</strong>
            </div>
          )}
        </section>

        {/* Voci */}
        <section className={styles.itemsSection}>
          <h3>Dettaglio del preventivo</h3>

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
                  const gross = item.quantity * item.unit_price;
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

        {/* Totali */}
        <section className={styles.totalsSection}>
          <dl className={styles.totals}>
            {/* ADATTA i nomi dei campi al ritorno di calcTotals */}
            <div>
              <dt>Imponibile</dt>
              <dd>{money.format(totals?.subtotal ?? 0)}</dd>
            </div>
            {surcharge !== 0 && (
              <div>
                <dt>Maggiorazione</dt>
                <dd>{money.format(surcharge)}</dd>
              </div>
            )}
            <div>
              <dt>IVA ({vatRate}%)</dt>
              <dd>{money.format(totals?.vat ?? 0)}</dd>
            </div>
            <div className={styles.grandTotal}>
              <dt>Totale</dt>
              <dd>{money.format(totals?.total ?? 0)}</dd>
            </div>
          </dl>
        </section>

        {/* Note e condizioni */}
        {tax.notes && (
          <section className={styles.termsSection}>
            <strong>Note</strong>
            <p>{tax.notes}</p>
          </section>
        )}

        {tax.terms && (
          <section className={styles.termsSection}>
            <strong>Condizioni</strong>
            <p>{tax.terms}</p>
          </section>
        )}

        <footer className={styles.footer}>Documento generato con Prevo</footer>
      </div>
    </div>
  );
}
