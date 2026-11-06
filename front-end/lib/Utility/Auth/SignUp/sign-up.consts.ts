import type { HTMLAttributes } from "react";
import type { SignUpFormValues } from "@/lib/Validations/auth";
import { User, Building2 } from "lucide-react";
import type {SelectOption, StepConfig} from "@/lib/Utility/Auth/SignUp/sign-up.types";

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
  // --- STEP 1: UTENTE ---
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

  // --- STEP 2: AZIENDA ---
  // Anagrafica
  company_name: {
    kind: "input",
    label: "Nome azienda",
    wide: true,
    autoComplete: "organization",
  },

  // Dati Fiscali
  vat_number: { kind: "input", label: "Partita IVA", required: false },
  tax_code: { kind: "input", label: "Codice fiscale", required: false },
  pec: {
    kind: "input",
    label: "PEC aziendale",
    type: "email",
    required: false,
  },
  iban: { kind: "input", label: "IBAN aziendale", wide: true, required: false },

  // Sede Legale
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

  // Contatti Aziendali
  company_email: {
    kind: "input",
    label: "Email aziendale",
    type: "email",
    autoComplete: "off",
  },
  phone: { kind: "input", label: "Telefono", type: "tel", autoComplete: "tel" },
  website: {
    kind: "input",
    label: "Sito web",
    type: "url",
    required: false,
    autoComplete: "url",
  },
};

export const initialValues: SignUpFormValues = {
  // Account personale
  name: "",
  surname: "",
  email: "",
  password: "",
  password_confirmation: "",

  // Anagrafica aziendale
  company_name: "",

  // Dati fiscali
  vat_number: "",
  tax_code: "",
  pec: "",
  iban: "",

  // Sede legale
  address: "",
  postal_code: "",
  city: "",
  province: "",

  // Contatti
  company_email: "",
  phone: "",
  website: "",
};

export const STEPS: StepConfig[] = [
  {
    id: "user",
    title: "Utente",
    heading: "Dati personali",
    description: "Crea le tue credenziali di accesso al profilo.",
    icon: User,
    fields: ["name", "surname", "email", "password", "password_confirmation"],
  },
  {
    id: "company",
    title: "Azienda",
    heading: "Informazioni aziendali",
    description:
      "Inserisci i dati legali, fiscali e la sede della tua attività.",
    icon: Building2,
    fields: [
      "company_name",
      "vat_number",
      "tax_code",
      "iban",
      "address",
      "postal_code",
      "city",
      "province",
      "phone",
      "company_email",
      "website",
    ],
  },
];

// Campi a tutta larghezza nella griglia a due colonne
export const WIDE_FIELDS = new Set<keyof SignUpFormValues>([
  "email",
  "company_name",
  "iban",
  "address",
]);

export const FIELD_LABELS: Record<keyof SignUpFormValues, string> = {
  name: "Nome",
  surname: "Cognome",
  email: "Email personale",
  password: "Password",
  password_confirmation: "Conferma password",
  company_name: "Nome azienda",
  vat_number: "Partita IVA",
  tax_code: "Codice fiscale",
  pec: "PEC aziendale",
  iban: "IBAN aziendale",
  address: "Indirizzo",
  postal_code: "CAP",
  city: "Città",
  province: "Provincia",
  phone: "Telefono",
  company_email: "Email aziendale",
  website: "Sito web",
};

// Campi che appartengono a un passo del form
export const FORM_FIELDS = new Set<string>(STEPS.flatMap((s) => s.fields));
