export interface Client {
    id: string;
    type: 'PERSON' | 'COMPANY';

    // Identità
    display_name: string;
    name: string | null;
    surname: string | null;
    company_name: string | null;

    // Contatti principali
    emails: ClientEmail[];
    phones: ClientPhone[];

    // Informazioni fiscali essenziali
    country_code: string;
    tax_code: string | null;
    vat_number: string | null;

    // Stato del record
    created_at: string;
    updated_at: string;
}

export interface ClientEmail {
    id: string;
    email: string;
    label: string | null;
    is_primary: boolean;
}

export interface ClientPhone {
    id: string;
    phone: string;
    label: string | null;
    is_primary: boolean;
}

export interface ClientUpdate extends Client {
    salutation: string | null;
    pec: string | null;
    website: string | null;
    sdi_code: string | null;
    default_vat_rate: number | null;
    is_public_administration: boolean;
    payment_terms: string | null;
    note: string | null;

    addresses: ClientAddress[];
    group_ids: string[];
}

export interface ClientAddress {
    id?: string;
    type: 'BILLING' | 'SHIPPING' | 'SITE';
    street: string;
    street_number: string | null;
    extra: string | null;
    postal_code: string;
    city: string;
    province: string | null;
    country_code: string;
    is_default: boolean;
}

export interface ClientDetail extends Client {
  salutation: string | null;
  pec: string | null;
  website: string | null;
  sdi_code: string | null;
  default_vat_rate: number | null;
  is_public_administration: boolean;
  payment_terms: string | null;
  note: string | null;
  addresses: ClientAddress[];
}

export type GetClientsResult =
  | { data: Client[]; meta?: { current_page: number; last_page: number; total: number } }
  | ApiError;

export type GetClientResult = { data: ClientDetail } | ApiError;

export interface ApiError {
    ok: false;
    message: string;
    errors?: Record<string, string[]>;
}

