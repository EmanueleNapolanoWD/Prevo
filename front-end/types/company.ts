export interface Company {
  id: string;
  name: string;
  legal_name: string;
  legal_form: string;
  slug: string;
  country_code: string;
  vat_number: string;
  tax_code: string;
  tax_regime: string;
  sdi_code: string;
  pec: string;
  rea_office: string;
  rea_number: string;
  share_capital: number;
  ateco_code: string;
  iban: string;
  address: string;
  postal_code: string;
  city: string;
  province: string;
  email: string;
  phone: string;
  website: string;
  logo_path: string;
  status: string;
  trial_ends_at: Date;
}

//Company Settings
export interface CompanySettingsData {
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

export type CompanyValues = {
  name?: string;
  legal_name?: string | null;
  legal_form?: string | null;
  country_code?: string;
  vat_number?: string;
  tax_code?: string | null;
  tax_regime?: string | null;
  sdi_code?: string | null;
  pec?: string | null;
  rea_office?: string | null;
  rea_number?: string | null;
  share_capital?: string | number | null;
  ateco_code?: string | null;
  iban?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  province?: string | null;
  email?: string;
  phone?: string | null;
  website?: string | null;
};

export type CompanyFormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  values?: CompanyValues;
};

export type UpdateCompanyResult =
  | { ok: true; slug?:string }
  | { ok: false; message?: string; errors?: Record<string, string[]> };
