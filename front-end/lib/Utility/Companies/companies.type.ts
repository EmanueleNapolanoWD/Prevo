/* ---------- Tabelle collegate ---------- */

type Timestamps = {
  created_at: string; // ISO 8601: nel JSON le date sono stringhe
  updated_at: string;
};

export type ContactItem = {
  id?: string | null;
  value: string;
  is_primary: boolean;
};

export type CompanyEmailType =
  | "general"
  | "administrative"
  | "billing"
  | "pec"
  | "support";

export type CompanyPhoneType =
  | "general"
  | "mobile"
  | "office"
  | "fax"
  | "support";

export type CompanyAddressType =
  | "legal"
  | "operational"
  | "administrative"
  | "billing"
  | "shipping";

export interface CompanyEmail extends Timestamps {
  id: string;
  company_id: string;
  email: string;
  type: CompanyEmailType;
  is_primary: boolean;
}

export interface CompanyPhone extends Timestamps {
  id: string;
  company_id: string;
  phone: string;
  type: CompanyPhoneType;
  is_primary: boolean;
}

export interface CompanyAddress extends Timestamps {
  id: string;
  company_id: string;
  label: string | null;
  type: CompanyAddressType;
  address: string;
  address_extra: string | null;
  postal_code: string;
  city: string;
  province: string | null;
  country_code: string;
  is_primary: boolean;
}

export type AddressItem = {
  id?: string | null;
  type: CompanyAddressType;
  label?: string | null;
  address: string;
  address_extra?: string | null;
  postal_code: string;
  city: string;
  province?: string | null;
  country_code: string;
  is_primary: boolean;
};

/* ---------- Company (risposta API) ---------- */

export interface Company extends Timestamps {
  id: string;
  slug: string;

  // identità
  name: string;
  legal_name: string;
  legal_form: string | null;

  // fiscale
  country_code: string; // default "IT"
  vat_number: string | null;
  tax_code: string | null;
  tax_regime: string | null;
  sdi_code: string | null;
  pec: string | null;
  rea_office: string | null;
  rea_number: string | null;
  share_capital: string | number | null; // decimal(15,2): Laravel lo serializza spesso come stringa
  ateco_code: string | null;
  iban: string | null;

  // online e branding
  website: string | null;
  logo_path: string | null;
  logo_url?: string | null; // solo se lo espone la Resource/accessor

  // tenant
  status: string; // default "trial"
  trial_ends_at: string | null;

  // relazioni: presenti solo se caricate con with()
  emails?: CompanyEmail[];
  phones?: CompanyPhone[];
  addresses?: CompanyAddress[];
  address?: CompanyAddress | null;
}

/* ---------- Form ---------- */

type EditableCompanyField =
  | "name"
  | "legal_name"
  | "legal_form"
  | "country_code"
  | "vat_number"
  | "tax_code"
  | "tax_regime"
  | "sdi_code"
  | "pec"
  | "rea_office"
  | "rea_number"
  | "share_capital"
  | "ateco_code"
  | "iban"
  | "website";

/** Valori del form: tutto opzionale e nullable. */
export type CompanyValues = {
  [K in EditableCompanyField]?: Company[K] | null;
} & {
  share_capital?: string | number | null;
  emails?: ContactItem[];
  phones?: ContactItem[];
  addresses?: AddressItem[];
  logo_url?: string | null;
};

export type TextFieldName = Exclude<
  keyof CompanyValues,
  "logo_url" | "emails" | "phones" | "addresses"
>;

export type FormStatus = "idle" | "saving" | "saved" | "error";

export type CompanyFormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  values?: CompanyValues;
};

export type UpdateCompanyResult =
  | { ok: true; slug?: string }
  | { ok: false; message?: string; errors?: Record<string, string[]> };

/** Payload inviato a Laravel: output dello schema Zod (stringhe, numeri, null). */
export type CompanyPayload = Record<string, string | number | null | undefined>;
