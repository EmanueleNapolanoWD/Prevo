import type { HTMLAttributes } from "react";
import type { SignUpFormValues } from "@/lib/Validations/auth";
import type { SelectOption } from "@/types/Auth/signup.type";

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

export const FIELD_CONFIG: Record<FieldName, FieldConfig> = {
  // Step 1 - Utente
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

  // Step 2 - Azienda
  company_name: {
    kind: "input",
    label: "Nome azienda",
    wide: true,
    autoComplete: "organization",
  },
  // legal_name: { kind: "input", label: "Ragione sociale", required: false, wide: true },
  company_email: {
    kind: "input",
    label: "Email aziendale",
    type: "email",
    autoComplete: "off", // evita che il browser ci metta l'email personale
  },
  phone: { kind: "input", label: "Telefono", type: "tel", autoComplete: "tel" },
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
  vat_number: { kind: "input", label: "Partita IVA", required: false },
  tax_code: { kind: "input", label: "Codice fiscale", required: false },
  website: {
    kind: "input",
    label: "Sito web",
    type: "url",
    required: false,
    autoComplete: "url",
  },
};
