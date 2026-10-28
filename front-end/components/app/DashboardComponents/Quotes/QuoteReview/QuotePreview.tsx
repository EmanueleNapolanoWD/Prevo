"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";

import type {
  QuoteSettingsData,
  QuoteItem,
  QuoteAppearanceValues,
  QuoteCompany,
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
  company: QuoteCompany | null;
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

// "IT60X0542811101000000123456" -> "IT60 X054 2811 1010 0000 0123 456"
function formatIban(iban: string): string {
  return iban.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}

function formatCompanyAddress(company: QuoteCompany): string {
  const cityLine = [company.postal_code, company.city]
    .filter(Boolean)
    .join(" ");
  const province = company.province ? ` (${company.province})` : "";
  return [company.address, `${cityLine}${province}`]
    .filter(Boolean)
    .join(", ");
}

export function QuotePreview({
  settings,
  company,
  header,
  tax,
  appearance,
  contact,
  selectedClient,
  items,
  totals,
  money,
}: QuotePreviewProps) {
  // se l'URL firmato del logo è scaduto o non carica, il logo si nasconde
  const [failedLogo, setFailedLogo] = useState<string | null>(null);

  const vatRate = parseNumber(tax.vat_rate);
  const surcharge = parseNumber(tax.surcharge);

  const showLogo = !!company?.logo_url && company.logo_url !== failedLogo;
  const companyName = company?.name ?? company?.name ?? null;

  const companyContacts = [company?.email, company?.phone].filter(Boolean);
  const hasPayment =
    !!settings?.default_payment_method ||
    !!settings?.default_payment_terms ||
    !!company?.iban;

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
        {/* Intestazione: azienda a sinistra, identità del documento a destra */}
        <header className={styles.header}>
          <div className={styles.brand}>
            {showLogo && company?.logo_url && (
              <Image
                src={company.logo_url}
                alt={`Logo di ${company.name}`}
                width={140}
                height={56}
                className={styles.logo}
                onError={() => setFailedLogo(company.logo_url)}
                unoptimized
              />
            )}

            {company ? (
              <div className={styles.companyInfo}>
                <strong className={styles.companyName}>{companyName}</strong>
                <p className={styles.companyMeta}>
                  {formatCompanyAddress(company)}
                </p>
                <p className={styles.companyMeta}>
                  P.IVA {company.vat_number}
                  {company.tax_code && ` · C.F. ${company.tax_code}`}
                </p>
                {companyContacts.length > 0 && (
                  <p className={styles.companyMeta}>
                    {companyContacts.join(" · ")}
                  </p>
                )}
              </div>
            ) : (
              <strong className={`${styles.companyName} ${styles.muted}`}>
                La tua azienda
              </strong>
            )}
          </div>

          <div className={styles.docMeta}>
            <span className={styles.eyebrow}>PREVENTIVO</span>
            <p className={styles.number}>N. {header.number || "—"}</p>
          </div>
        </header>

        {/* Titolo e descrizione */}
        <section className={styles.titleBlock}>
          <h2 className={!header.title ? styles.muted : undefined}>
            {header.title || "Titolo del preventivo"}
          </h2>
          {header.description && (
            <p className={styles.description}>{header.description}</p>
          )}
        </section>

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

        {/* Pagamento */}
        {hasPayment && (
          <section className={styles.paymentSection}>
            <strong>Pagamento</strong>
            {settings?.default_payment_method && (
              <p>Metodo: {settings.default_payment_method}</p>
            )}
            {settings?.default_payment_terms && (
              <p>{settings.default_payment_terms}</p>
            )}
            {company?.iban && (
              <p className={styles.iban}>IBAN {formatIban(company.iban)}</p>
            )}
          </section>
        )}

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