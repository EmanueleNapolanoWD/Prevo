// ===== UI: riga del preventivo nel form =====

export type DiscountType = "percentage" | "fixed";

export interface QuoteItem {
  id: string;
  product_id: string | null;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_type: DiscountType;
  discount_value: number;
}

export const QUOTE_TEMPLATES = [
  {
    key: "classic",
    label: "Classico",
    description: "Intestazione a banda colorata",
  },
  {
    key: "modern",
    label: "Moderno",
    description: "Barra laterale e molto spazio",
  },
  {
    key: "minimal",
    label: "Minimale",
    description: "Solo filetti, niente riempimenti",
  },
] as const;

export type QuoteTemplateKey = (typeof QUOTE_TEMPLATES)[number]["key"];

export const COLOR_PRESETS = [
  { label: "Grafite", primary: "#1F2937", accent: "#2563EB" },
  { label: "Verde", primary: "#14532D", accent: "#16A34A" },
  { label: "Bordeaux", primary: "#7F1D1D", accent: "#D97706" },
  { label: "Viola", primary: "#4C1D95", accent: "#DB2777" },
] as const;

export interface QuoteAppearanceValues {
  template: QuoteTemplateKey;
  primaryColor: string;
  accentColor: string;
}

// ===== Impostazioni preventivi dell'azienda =====
export interface QuoteSettingsData {
  // Anagrafica
  company_name?: string | null;

  // Numerazione preventivi
  quote_prefix: string;
  quote_start_number: number;
  next_quote_number: number;
  quote_number_resets_yearly: boolean;
  quote_number_padding: number;
  quote_validity_days: number;

  // Fiscale / importi
  default_vat_rate: number;
  default_vat_nature: string | null;
  prices_include_vat: boolean;
  stamp_duty_enabled: boolean;
  default_currency: string;

  // Condizioni commerciali
  default_validity_days: number;
  default_payment_terms: string | null;
  default_payment_method: string | null;
  default_notes: string | null;
  default_terms: string | null;

  // Localizzazione
  locale: string;
  timezone: string;
  date_format: string;
}

// ===== API: creazione preventivo (POST /api/companies/{slug}/quotes) =====
export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

export type QuoteDiscountType = "percentage" | "fixed";

export const DISCOUNT_TYPE_TO_API: Record<DiscountType, QuoteDiscountType> = {
  percentage: "percentage",
  fixed: "fixed",
};

/** Riga inviata al backend. Importi in euro; subtotale, IVA e totali li calcola il backend. */
export interface QuotePayloadItem {
  product_id?: string | null;
  description: string;
  unit?: string;
  quantity: number; // max 3 decimali
  unit_price: number; // max 2 decimali
  vat_rate?: number | null; // null/assente => aliquota del preventivo
  discount_type?: QuoteDiscountType | null;
  discount_value?: number | null; // % se PERCENTAGE, euro se FIXED
}

/**
 * Payload di creazione. NON inviare `number` né totali: il backend li ignora
 * (il numero lo assegna lui, dentro una transazione).
 * I campi opzionali ricadono sui default di quote_settings.
 */
export interface QuotePayload {
  client_id: string;
  title: string;
  description?: string | null;
  notes?: string | null;
  terms?: string | null;
  valid_until?: string | null; // "YYYY-MM-DD"
  vat_rate?: number | null;
  surcharge?: number; // importo fisso in euro, max 2 decimali
  discount_type?: QuoteDiscountType | null;
  discount_value?: number | null; // % se PERCENTAGE, euro se FIXED
  appearance?: {
    template?: QuoteTemplateKey;
    primary_color?: string; // "#RRGGBB"
    accent_color?: string;
  };
  contact?: {
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  items: QuotePayloadItem[];
}

// ===== API: preventivo restituito dal backend (QuoteResource) =====
export interface QuoteClientSnapshot {
  id: string;
  type: "PERSON" | "COMPANY" | null;
  display_name: string | null;
  contact: {
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
}

export interface QuoteLine {
  id: string;
  product_id: string | null;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  discount_type: QuoteDiscountType | null;
  discount_value: number | null;
  vat_rate: number;
  subtotal: number; // imponibile di riga, al netto dello sconto
  tax_amount: number;
  total: number;
  sort_order: number;
}

export interface Quote {
  id: string;
  number: string; // es. "PREV-2026-0001"
  version: number;
  status: QuoteStatus;
  title: string;
  description: string | null;
  notes: string | null;
  terms: string | null;
  valid_until: string | null; // ISO 8601
  client_id: string | null;
  client: QuoteClientSnapshot | null;
  appearance: {
    template: QuoteTemplateKey;
    primary_color: string;
    accent_color: string;
  };
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  currency: string;
  subtotal: number; // somma righe prima degli sconti
  discount_total: number;
  surcharge: number;
  taxable_amount: number;
  tax_total: number;
  total: number;
  items: QuoteLine[];
  created_at: string | null;
  updated_at: string | null;
}

// ===== Mapping UI -> payload =====

/** Converte la riga del form nella riga del payload. */
export function toQuotePayloadItem(item: QuoteItem): QuotePayloadItem {
  return {
    product_id: item.product_id,
    // quote_items ha solo `description`: nome e descrizione vengono uniti.
    description: item.description
      ? `${item.name}\n${item.description}`
      : item.name,
    unit: item.unit,
    quantity: item.quantity,
    unit_price: item.unit_price,
    ...(item.discount_value > 0
      ? {
          discount_type: DISCOUNT_TYPE_TO_API[item.discount_type],
          discount_value: item.discount_value,
        }
      : {}),
  };
}

/** Converte i colori del form (camelCase) nel formato dell'API. */
export function toQuotePayloadAppearance(
  a: QuoteAppearanceValues,
): NonNullable<QuotePayload["appearance"]> {
  return {
    template: a.template,
    primary_color: a.primaryColor,
    accent_color: a.accentColor,
  };
}