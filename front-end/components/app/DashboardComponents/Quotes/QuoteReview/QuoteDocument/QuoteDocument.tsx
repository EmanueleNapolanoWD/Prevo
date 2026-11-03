import type { CSSProperties } from "react";

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
} from "../../hooks/useQuoteForm";
import type { ClientDetail } from "@/types/client";
import { parseNumber, type calcTotals } from "@/lib/utils";

import { QuoteDocumentHeader } from "./QuoteDocumentHeader";
import { QuoteTitleBlock } from "./QuoteTitleBlock";
import { QuoteRecipient } from "./QuoteRecipient";
import { QuoteItemsTable } from "./QuoteItemsTable";
import { QuoteTotals } from "./QuoteTotals";
import { QuotePaymentInfo } from "./QuotePaymentInfo";
import { QuoteTextSection } from "./QuoteTextSection";
import styles from "./QuoteDocument.module.css";

type CalculatedTotals = ReturnType<typeof calcTotals>;

export interface QuoteDocumentProps {
  settings: QuoteSettingsData | null;
  company: QuoteCompany | null;
  header: QuoteHeaderValues;
  tax: TaxQuoteValue;
  appearance: QuoteAppearanceValues;
  contact: QuoteContact;
  selectedClient: ClientDetail | null;
  items: QuoteItem[];
  totals: CalculatedTotals | null;
  money: Intl.NumberFormat;
}

/**
 * Il documento del preventivo: nessun contenitore dell'editor, nessuno stato,
 * nessuna chiamata API. Riceve i dati già pronti (totali inclusi) via props.
 */
export function QuoteDocument({
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
}: QuoteDocumentProps) {
  const vatRate = parseNumber(tax.vat_rate);
  const surcharge = parseNumber(tax.surcharge);

  return (
    <div
      className={styles.document}
      data-template={appearance.template}
      style={
        {
          "--quote-primary": appearance.primaryColor,
          "--quote-accent": appearance.accentColor,
        } as CSSProperties
      }
    >
      <QuoteDocumentHeader company={company} number={header.number} />

      <QuoteTitleBlock
        title={header.title}
        description={header.description}
      />

      <QuoteRecipient
        selectedClient={selectedClient}
        address={contact.address}
        email={contact.email}
        phone={contact.phone}
        validUntil={tax.valid_until}
      />

      <QuoteItemsTable items={items} money={money} />

      {/* ADATTA i nomi dei campi al ritorno di calcTotals (commento originale) */}
      <QuoteTotals
        subtotal={totals?.subtotal ?? 0}
        vat={totals?.vat ?? 0}
        total={totals?.total ?? 0}
        vatRate={vatRate}
        surcharge={surcharge}
        money={money}
      />

      <QuotePaymentInfo
        paymentMethod={settings?.default_payment_method}
        paymentTerms={settings?.default_payment_terms}
        iban={company?.iban}
      />

      {tax.notes && <QuoteTextSection title="Note" text={tax.notes} />}

      {tax.terms && <QuoteTextSection title="Condizioni" text={tax.terms} />}

      <footer className={styles.footer}>Documento generato con Prevo</footer>
    </div>
  );
}
