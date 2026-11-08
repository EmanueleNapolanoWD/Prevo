"use client";

import {
  QuoteDocument,
  QuoteDocumentProps,
} from "@/components/app/DashboardComponents/Quotes/QuoteReview/QuoteDocument/QuoteDocument";
import { Quote } from "@/lib/Utility/Quote/quote.types";

const money = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

interface PrintQuoteDocument extends QuoteDocumentProps {
  quote: Quote;
}

export default function PrintQuote({ data }: { data: PrintQuoteDocument }) {
  const { quote, company, settings } = data;

  const items = (quote.items ?? []).map((i) => {
    const [name, ...rest] = String(i.description ?? "").split("\n");
    return {
      ...i,
      name: i.name ?? name,
      description: i.name ? i.description : rest.join("\n"),
      discount_type:
        String(i.discount_type).toLowerCase() === "percentage"
          ? "percentage"
          : "fixed",
    };
  });

  return (
    <QuoteDocument
      settings={settings}
      company={company}
      header={{
        number: quote.number,
        title: quote.title,
        description: quote.description,
      }}
      tax={{
        vat_rate: quote.vat_rate,
        surcharge: quote.surcharge,
        valid_until: quote.valid_until,
        notes: quote.notes,
        terms: quote.terms,
      }}
      appearance={{
        template: quote.appearance?.template,
        primaryColor: quote.appearance?.primary_color,
        accentColor: quote.appearance?.accent_color,
      }}
      contact={quote.contact ?? {}}
      selectedClient={quote.client ?? null}
      items={items}
      totals={{
        subtotal: Number(quote.taxable_amount ?? quote.subtotal),
        vat: Number(quote.tax_total),
        total: Number(quote.total),
      }}
      money={money}
    />
  );
}
