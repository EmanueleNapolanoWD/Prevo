import type { CompanySettingsData } from "@/types/company";

export type Option = { value: string; label: string };

const toOptions = (values: string[]): Option[] =>
  values.map((v) => ({ value: v, label: v }));

/** Stessi default del model Laravel. */
export const DEFAULT_SETTINGS: CompanySettingsData = {
  quote_prefix: "PREV",
  quote_start_number: 1,
  next_quote_number: 1,
  quote_number_resets_yearly: true,
  quote_number_padding: 4,
  default_vat_rate: 22,
  default_vat_nature: null,
  prices_include_vat: false,
  stamp_duty_enabled: false,
  default_currency: "EUR",
  default_validity_days: 30,
  default_payment_terms: null,
  default_payment_method: null,
  default_notes: null,
  default_terms: null,
  locale: "it",
  timezone: "Europe/Rome",
  date_format: "d/m/Y",
};

export const VAT_NATURES: Option[] = [
  { value: "N1", label: "N1 – Escluse ex art. 15" },
  { value: "N2.1", label: "N2.1 – Non soggette (artt. 7-7septies)" },
  { value: "N2.2", label: "N2.2 – Non soggette (altri casi)" },
  { value: "N3.1", label: "N3.1 – Non imponibili (esportazioni)" },
  { value: "N3.2", label: "N3.2 – Non imponibili (cessioni intracomunitarie)" },
  { value: "N4", label: "N4 – Esenti" },
  { value: "N5", label: "N5 – Regime del margine" },
  { value: "N6.1", label: "N6.1 – Reverse charge (rottami)" },
  { value: "N7", label: "N7 – IVA assolta in altro stato UE" },
];

export const PAYMENT_METHODS = toOptions([
  "Bonifico bancario",
  "Carta di credito/debito",
  "Contanti",
  "Assegno",
  "RiBa",
  "PayPal",
]);

export const CURRENCIES = toOptions(["EUR", "USD", "GBP", "CHF"]);

export const LOCALES: Option[] = [
  { value: "it", label: "Italiano" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
];

export const TIMEZONES = toOptions([
  "Europe/Rome",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Zurich",
  "America/New_York",
  "UTC",
]);

// formati in sintassi PHP, coerenti con il default del backend
export const DATE_FORMATS: Option[] = [
  { value: "d/m/Y", label: "31/12/2026" },
  { value: "d-m-Y", label: "31-12-2026" },
  { value: "Y-m-d", label: "2026-12-31" },
  { value: "m/d/Y", label: "12/31/2026" },
];