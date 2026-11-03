import { QuoteDocumentProps } from "../../../components/app/DashboardComponents/Quotes/QuoteReview/QuoteDocument/QuoteDocument";
import {
  QuoteSettingsData,
  QuoteCompany,
} from "@/types/quote";


/** Cliente come arriva da QuoteResource (client_snapshot) */
interface PrintClient {
  id: string;
  type: "PERSON" | "COMPANY";
  display_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contact?: {
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  tax_code: string | null;
  vat_number: string | null;
}

/** Preventivo come arriva da QuoteResource */
interface PrintQuote {
  id: string;
  number: string;
  version: number;
  status: string;
  title: string;
  description: string | null;
  notes: string | null;
  terms: string | null;
  valid_until: string | null;
  currency: string;

  client: PrintClient | null;
  appearance: {
    template: string;
    primary_color: string;
    accent_color: string;
  };
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
  };

  subtotal: number;
  discount_total: number;
  surcharge: number;
  taxable_amount: number;
  tax_total: number;
  total: number;

  items: PrintQuoteItem[];
}

/** Riga come arriva da QuoteItemResource */
interface PrintQuoteItem {
  id: string;
  product_id: string | null;
  description: string;
  unit: string | null;
  quantity: number;
  unit_price: number;
  discount_type: string | null;
  discount_value: number | null;
  vat_rate: number;
  subtotal: number;
  tax_amount: number;
  total: number;
  sort_order: number;
}

/** Risposta di GET /api/companies/{slug}/quotes/{id}/print (BuildQuotePrintDataAction) */
export interface PrintQuoteData {
  quote: PrintQuote;
  company: QuoteCompany | null;
  settings: QuoteSettingsData | null;
}

export function snapshotToDocumentProps(
  data: PrintQuoteData,
): Omit<QuoteDocumentProps, "money"> {
  const { quote } = data;

  // L'aliquota è per riga: il documento mostra un'unica aliquota (la prima riga)
  const vatRate =
    quote.items?.[0]?.vat_rate ?? data.settings?.default_vat_rate ?? 0;

  return {
    settings: data.settings,
    company: data.company,
    header: {
      number: quote.number,
      title: quote.title,
      description: quote.description ?? "",
    },
    tax: {
      vat_rate: String(vatRate),
      surcharge: String(quote.surcharge ?? 0),
      valid_until: quote.valid_until ?? "",
      notes: quote.notes ?? "",
      terms: quote.terms ?? "",
    },
    appearance: {
      template: quote.appearance.template,
      primaryColor: quote.appearance.primary_color,
      accentColor: quote.appearance.accent_color,
    },
    contact: {
      address: quote.contact?.address ?? "",
      email: quote.contact?.email ?? "",
      phone: quote.contact?.phone ?? "",
    },
    selectedClient: (quote.client ??
      null) as QuoteDocumentProps["selectedClient"],
    items: quote.items,
    totals: {
      subtotal: quote.taxable_amount,
      vat: quote.tax_total,
      total: quote.total,
    } as QuoteDocumentProps["totals"],
  };
}
