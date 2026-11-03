"use client";

import {
  QuoteDocument,
  QuoteDocumentProps,
} from "@/components/app/DashboardComponents/Quotes/QuoteReview/QuoteDocument/QuoteDocument";
import { Quote } from "@/types/quote";

const money = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

interface PrintQuoteDocument extends QuoteDocumentProps {
  quote: Quote;
}

export default function PrintQuote({ data }: { data: PrintQuoteDocument }) {
  const { quote, company, settings } = data;

  return (
    <QuoteDocument
      settings={settings}
      company={company}
      header={{
        number: quote.number,
        title: quote.title,
        description: quote?.description,
      }}
      tax={{
        vat_rate: quote.vat_rate,
        surcharge: quote.surcharge,
        valid_until: quote.valid_until,
        notes: quote.notes,
        terms: quote.terms,
      }}
      appearance={{
        template: quote.template,
        primaryColor: quote.primary_color,
        accentColor: quote.accent_color,
      }}
      contact={quote.contact ?? {}}
      selectedClient={quote.client ?? null}
      items={quote.items ?? []}
      totals={{
        subtotal: Number(quote.taxable_amount ?? quote.subtotal),
        vat: Number(quote.tax_total),
        total: Number(quote.total),
      }}
      money={money}
    />
  );
}
