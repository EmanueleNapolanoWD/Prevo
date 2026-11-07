import type { QuoteAppearanceValues, QuoteCompany } from "@/lib/Utility/Quote/quote.types";
import { Company } from "../Companies/companies.type";

export type QuoteSettingsData = {
  // Template
  default_quote_template: string;
  quote_primary_color: string;
  quote_accent_color: string;

  // Numerazione
  quote_prefix: string;
  quote_start_number: number;
  next_quote_number: number;
  quote_number_year: number | null;
  quote_number_resets_yearly: boolean;
  quote_number_padding: number;

  // Fiscale
  default_vat_rate: number;
  default_vat_nature: string | null;
  prices_include_vat: boolean;
  stamp_duty_enabled: boolean;
  default_currency: string;

  // Condizioni
  default_validity_days: number;
  default_payment_terms: string | null;
  default_payment_method: string | null;
  default_notes: string | null;
  default_terms: string | null;

  // Localizzazione
  locale: string;
  timezone: string;
  date_format: string;

  updated_at: string | null;

  company?: QuoteCompany;
};

export type QuoteSettingsDataWithCompany = QuoteSettingsData & {
  company: Company;
};

export type QuoteTemplate = QuoteAppearanceValues["template"];

export type SetField = <K extends keyof QuoteSettingsData>(
  key: K,
  value: QuoteSettingsData[K],
) => void;

/** Props comuni a tutte le sezioni del form. */
export type SectionProps = {
  values: QuoteSettingsData;
  set: SetField;
};

export type FormMessage = { type: "ok" | "error"; text: string } | null;
