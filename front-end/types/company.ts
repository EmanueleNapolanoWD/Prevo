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
