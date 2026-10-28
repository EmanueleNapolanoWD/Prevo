// ============================================================================
// UI: riga del preventivo nel form
// ============================================================================

import { CompanyValues } from "./company";

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

// ============================================================================
// Impostazioni preventivi dell'azienda
// ============================================================================

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

  company: QuoteCompany | null;
}

// ============================================================================
// Stato e sconti (valori dell'API)
// ============================================================================

export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

// Etichette italiane e stili per la lista (le chiavi sono quelle dell'API)
export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: "Bozza",
  SENT: "Inviato",
  VIEWED: "Visualizzato",
  ACCEPTED: "Accettato",
  REJECTED: "Rifiutato",
  EXPIRED: "Scaduto",
};

export const QUOTE_STATUS_STYLES: Record<QuoteStatus, string> = {
  DRAFT: "border-amber-200 bg-amber-50 text-amber-700",
  SENT: "border-blue-200 bg-blue-50 text-blue-700",
  VIEWED: "border-violet-200 bg-violet-50 text-violet-700",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-slate-200 bg-slate-50 text-slate-700",
  EXPIRED: "border-rose-200 bg-rose-50 text-rose-700",
};

export type QuoteDiscountType = "percentage" | "fixed";

export const DISCOUNT_TYPE_TO_API: Record<DiscountType, QuoteDiscountType> = {
  percentage: "percentage",
  fixed: "fixed",
};

export const API_TO_DISCOUNT_TYPE: Record<QuoteDiscountType, DiscountType> = {
  percentage: "percentage",
  fixed: "fixed",
};

// ============================================================================
// Payload inviato al backend (creazione e modifica)
// ============================================================================

/** Riga inviata al backend. Importi in euro; subtotale, IVA e totali li calcola il backend. */
export interface QuotePayloadItem {
  product_id?: string | null;
  description: string;
  unit?: string;
  quantity: number; // max 3 decimali
  unit_price: number; // max 2 decimali
  vat_rate?: number | null; // null/assente => aliquota del preventivo
  discount_type?: QuoteDiscountType | null;
  discount_value?: number | null; // % se percentage, euro se fixed
}

/**
 * Payload di creazione e di modifica. NON inviare `number` né totali: il
 * backend li ignora (il numero lo assegna lui, dentro una transazione).
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
  discount_value?: number | null; // % se percentage, euro se fixed
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
  version?: number;
}

// ============================================================================
// API: preventivo restituito dal backend (QuoteResource)
// ============================================================================

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
  vat_rate: number; // aliquota del preventivo
  discount_type: QuoteDiscountType | null; // sconto globale
  discount_value: number | null; // % se percentage, euro se fixed
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

export type QuoteCompany = {
  name: string;
  legal_name: string | null;
  vat_number: string;
  tax_code: string | null;
  tax_regime: string | null;
  sdi_code: string | null;
  pec: string | null;
  iban: string | null;
  address: string;
  postal_code: string;
  city: string;
  province: string;
  email: string;
  phone: string;
  logo_url: string | null;
};

export type SubmitResult =
  | { ok: true; data: Quote }
  | { ok: false; error: string };

// Alias usato dal hook useQuoteForm
export type QuoteDetail = Quote;

// ============================================================================
// Mapping UI -> payload
// ============================================================================

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

// ============================================================================
// Mapping API -> UI (per la modifica)
// ============================================================================

/**
 * Inverso di toQuotePayloadItem: la prima riga di `description` è il nome,
 * il resto è la descrizione. Number() perché Laravel può restituire i
 * decimali come stringhe.
 */
export function toQuoteItem(line: QuoteLine): QuoteItem {
  const [name, ...rest] = line.description.split("\n");
  return {
    id: String(line.id),
    product_id: line.product_id,
    name,
    description: rest.join("\n"),
    quantity: Number(line.quantity),
    unit: line.unit,
    unit_price: Number(line.unit_price),
    discount_type: line.discount_type
      ? API_TO_DISCOUNT_TYPE[line.discount_type]
      : "percentage",
    discount_value: Number(line.discount_value ?? 0),
  };
}

/** Inverso di toQuotePayloadAppearance. */
export function toQuoteAppearanceValues(
  a: Quote["appearance"],
): QuoteAppearanceValues {
  return {
    template: a.template,
    primaryColor: a.primary_color,
    accentColor: a.accent_color,
  };
}
