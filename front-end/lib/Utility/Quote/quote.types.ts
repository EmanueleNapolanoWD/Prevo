import type { calcTotals } from "@/lib/utils";
import type { Product } from "@/types/product";
import type { ClientDetail } from "@/lib/Utility/Clients/clients.types";
import type { QuoteSettingsData } from "@/lib/Utility/QuoteSettings/quote-settings.types";
import { Company } from "../Companies/companies.type";

// ============================================================================
// TIPI PUBBLICI
// ============================================================================

// ============================================================================
// UI: riga del preventivo nel form
// ============================================================================

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
  /** Ordine di visualizzazione della riga nel preventivo. */
  sort_order?: number;
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
  description: string | null;
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


// Alias usato dal hook useQuoteForm
export type QuoteDetail = Quote;

export interface QuoteContact {
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface QuoteHeaderValues {
  number: string;
  title: string;
  description: string;
}

export interface TaxQuoteValue {
  vat_rate: string; // era number
  valid_until: string;
  surcharge: string; // era number
  discount_type: DiscountType;
  discount_value: string;
  notes: string;
  terms: string;
}

export type SubmitResult =
  | { ok: true; data: Quote }
  | { ok: false; error: string };

// ============================================================================
// TIPI INTERNI
// ============================================================================

export type ContactId = string | number;
export type QuoteTotals = ReturnType<typeof calcTotals>;
export type ClientEmail = NonNullable<ClientDetail["emails"]>[number];
export type ClientPhone = NonNullable<ClientDetail["phones"]>[number];
export type ClientAddress = NonNullable<ClientDetail["addresses"]>[number];

export type SearchResponse<T> = { ok: false; message: string } | { data: T[] };

export type PersistedQuote = {
  id: QuoteDetail["id"];
  version: number | undefined;
};

/** Valori di partenza del form (da preventivo in modifica, vuoti in creazione). */
export type QuoteInitialValues = {
  header: Partial<QuoteHeaderValues>;
  tax: Partial<TaxQuoteValue>;
  appearance: Partial<QuoteAppearanceValues>;
  contact: Partial<QuoteContact>;
  items: QuoteItem[];
  client: ClientDetail | null;
};

/** Numeri già parsati e validati, pronti per costruire il payload. */
export type ParsedQuoteValues = {
  clientId: QuotePayload["client_id"];
  vatRate: number;
  surcharge: number;
  discountValue: number;
};

export type ValidationResult =
  | { ok: true; values: ParsedQuoteValues }
  | { ok: false; error: string };

// ============================================================================
// OPZIONI E VALORE DI RITORNO DELL'HOOK
// ============================================================================

export interface UseQuoteFormOptions {
  slug: string;
  /** Presente = modalità modifica. */
  quote?: QuoteDetail;
  /**
   * Cliente completo (con emails, phones, addresses) per la modifica.
   * quote.client è solo uno snapshot: il cliente va caricato a parte
   * nella page di edit.
   */
  initialClient?: ClientDetail | null;
}

export interface UseQuoteFormReturn {
  // --- modalità ---
  isEdit: boolean;

  // --- azienda ---
  company: Company | null;

  // --- impostazioni azienda ---
  settings: QuoteSettingsData | null;
  settingsLoading: boolean;
  settingsError: string | null;
  currency: string;
  money: Intl.NumberFormat;

  // --- valori del form (default + modifiche dell'utente) ---
  header: QuoteHeaderValues;
  tax: TaxQuoteValue;
  appearance: QuoteAppearanceValues;
  contact: QuoteContact;
  items: QuoteItem[];
  totals: QuoteTotals | null;

  // --- clienti ---
  clients: ClientDetail[];
  clientQuery: string;
  clientsLoading: boolean;
  clientError: string | null;
  selectedClient: ClientDetail | null;
  selectedEmail: ClientEmail | null;
  selectedPhone: ClientPhone | null;
  selectedAddress: ClientAddress | null;
  selectedEmailId: ContactId | null;
  selectedPhoneId: ContactId | null;
  selectedAddressId: ContactId | null;

  // --- prodotti ---
  products: Product[];
  productQuery: string;
  productsLoading: boolean;
  productError: string | null;
  selectedProduct: Product | null;

  // --- azioni ---
  setSelectedClient: (client: ClientDetail | null) => void;
  setClientQuery: (query: string) => void;
  setSelectedEmailId: (id: ContactId | null) => void;
  setSelectedPhoneId: (id: ContactId | null) => void;
  setSelectedAddressId: (id: ContactId | null) => void;
  setContact: (patch: Partial<QuoteContact>) => void;

  setQuoteNumber: (value: string) => void;
  setQuoteTitle: (value: string) => void;
  setQuoteDescription: (value: string | null) => void;
  setHeader: (values: QuoteHeaderValues) => void;
  setTax: (values: TaxQuoteValue) => void;
  setAppearance: (values: QuoteAppearanceValues) => void;

  setItems: (items: QuoteItem[]) => void;
  addItem: (item: Omit<QuoteItem, "id">) => void;
  removeItem: (id: string) => void;
  resetItems: () => void;

  setProductQuery: (query: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  clearSelection: () => void;

  resetForm: () => void;
  submit: () => Promise<SubmitResult>;
}
