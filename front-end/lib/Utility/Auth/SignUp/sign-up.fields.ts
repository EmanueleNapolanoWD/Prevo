import type { HTMLAttributes } from "react";
import type { SignUpFormValues } from "@/lib/Validations/auth";
import type { SelectOption } from "@/types/Auth/signup.type";
import { LEGAL_FORMS, COUNTRIES, TAX_REGIMES } from "./sign-up.consts";

export type FieldName = keyof SignUpFormValues;

interface BaseField {
  label: string;
  required?: boolean; // default: true
  wide?: boolean; // occupa tutta la larghezza della griglia
  autoComplete?: string; // default: "off"
}

export type FieldConfig =
  | (BaseField & {
      kind: "input";
      type?: "text" | "email" | "password" | "tel" | "url";
      placeholder?: string;
      inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
    })
  | (BaseField & { kind: "select"; options: SelectOption[] });

// Record<FieldName, ...>: se aggiungi un campo allo schema, TypeScript
// ti obbliga a configurarlo qui.
export const FIELD_CONFIG: Record<FieldName, FieldConfig> = {
  // Account
  name: { kind: "input", label: "Nome", autoComplete: "given-name" },
  surname: { kind: "input", label: "Cognome", autoComplete: "family-name" },
  email: {
    kind: "input",
    label: "Email personale",
    type: "email",
    wide: true,
    autoComplete: "email",
  },
  password: {
    kind: "input",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
  },
  password_confirmation: {
    kind: "input",
    label: "Conferma password",
    type: "password",
    autoComplete: "new-password",
  },

  // Azienda
  company_name: {
    kind: "input",
    label: "Nome azienda",
    autoComplete: "organization",
  },
  legal_name: { kind: "input", label: "Ragione sociale" },
  legal_form: {
    kind: "select",
    label: "Forma giuridica",
    options: LEGAL_FORMS,
  },
  country_code: {
    kind: "select",
    label: "Paese",
    options: COUNTRIES,
    autoComplete: "country",
  },

  // Fiscale
  vat_number: { kind: "input", label: "Partita IVA" },
  tax_code: { kind: "input", label: "Codice fiscale" },
  tax_regime: {
    kind: "select",
    label: "Regime fiscale",
    options: TAX_REGIMES,
    wide: true,
  },
  sdi_code: {
    kind: "input",
    label: "Codice destinatario SDI",
    required: false,
  },
  pec: {
    kind: "input",
    label: "PEC aziendale",
    type: "email",
    required: false,
  },

  // REA
  rea_office: {
    kind: "input",
    label: "Provincia ufficio REA",
    required: false,
  },
  rea_number: { kind: "input", label: "Numero REA", required: false },
  share_capital: {
    kind: "input",
    label: "Capitale sociale (€)",
    inputMode: "decimal",
    required: false,
  },
  ateco_code: { kind: "input", label: "Codice ATECO", required: false },
  iban: { kind: "input", label: "IBAN aziendale", wide: true, required: false },

  // Sede e contatti
  address: {
    kind: "input",
    label: "Indirizzo",
    wide: true,
    autoComplete: "street-address",
  },
  postal_code: {
    kind: "input",
    label: "CAP",
    inputMode: "numeric",
    autoComplete: "postal-code",
  },
  city: { kind: "input", label: "Città", autoComplete: "address-level2" },
  province: {
    kind: "input",
    label: "Provincia",
    placeholder: "es. NA",
    autoComplete: "address-level1",
  },
  phone: { kind: "input", label: "Telefono", type: "tel", autoComplete: "tel" },
  company_email: {
    kind: "input",
    label: "Email aziendale",
    type: "email",
    autoComplete: "email",
  },
  website: {
    kind: "input",
    label: "Sito web",
    type: "url",
    required: false,
    autoComplete: "url",
  },
};
