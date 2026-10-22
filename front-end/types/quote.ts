export interface QuoteItem {
  id: string;
  product_id: string | null;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount: number; // percentuale, 0-100
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

//Company Settings
export interface QuoteSettingsData {
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
