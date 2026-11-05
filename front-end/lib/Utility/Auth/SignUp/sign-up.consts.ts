import type { HTMLAttributes } from "react";
import type { SignUpFormValues } from "@/lib/Validations/auth";
import type { SelectOption, StepConfig } from "@/types/Auth/signup.type";
import { User, Building2 } from "lucide-react";

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

export const LEGAL_FORMS: SelectOption[] = [
  { value: "", label: "Seleziona la forma giuridica" },
  { value: "DITTA_INDIVIDUALE", label: "Ditta individuale" },
  { value: "SRL", label: "S.r.l." },
  { value: "SRLS", label: "S.r.l.s." },
  { value: "SPA", label: "S.p.A." },
  { value: "SNC", label: "S.n.c." },
  { value: "SAS", label: "S.a.s." },
  { value: "SOCIETA_SEMPLICE", label: "Società semplice" },
  { value: "ALTRO", label: "Altro" },
];

export const COUNTRIES: SelectOption[] = [
  { value: "IT", label: "Italia" },
  { value: "DE", label: "Germania" },
  { value: "FR", label: "Francia" },
  { value: "ES", label: "Spagna" },
  { value: "AT", label: "Austria" },
  { value: "CH", label: "Svizzera" },
  { value: "BE", label: "Belgio" },
  { value: "NL", label: "Paesi Bassi" },
  { value: "PT", label: "Portogallo" },
  { value: "GB", label: "Regno Unito" },
];

export const TAX_REGIMES: SelectOption[] = [
  { value: "", label: "Seleziona il regime fiscale" },
  { value: "RF01", label: "RF01 - Ordinario" },
  { value: "RF02", label: "RF02 - Contribuenti minimi" },
  { value: "RF04", label: "RF04 - Agricoltura" },
  { value: "RF05", label: "RF05 - Vendita sali e tabacchi" },
  { value: "RF06", label: "RF06 - Gestione di servizi di telefonia pubblica" },
  { value: "RF07", label: "RF07 - Rivendita documenti di trasporto pubblico" },
  { value: "RF08", label: "RF08 - Editoria" },
  { value: "RF09", label: "RF09 - Attività di intrattenimento e giochi" },
  { value: "RF10", label: "RF10 - Agenzie di viaggi" },
  { value: "RF11", label: "RF11 - Agriturismo" },
  { value: "RF12", label: "RF12 - Vendite a domicilio" },
  { value: "RF13", label: "RF13 - Beni usati e altri casi speciali" },
  { value: "RF14", label: "RF14 - Agenzie di vendite all'asta" },
  { value: "RF15", label: "RF15 - IVA per cassa" },
  { value: "RF16", label: "RF16 - Altri casi particolari" },
  { value: "RF17", label: "RF17 - IVA per cassa (PA)" },
  { value: "RF18", label: "RF18 - Altro" },
  { value: "RF19", label: "RF19 - Regime forfettario" },
];

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
  legal_name: {
    kind: "input",
    label: "Ragione sociale",
    required: false,
    wide: true,
  },
  legal_form: {
    kind: "select",
    label: "Forma giuridica",
    options: LEGAL_FORMS,
  },
  country_code: {
    kind: "select",
    label: "Paese",
    options: COUNTRIES,
  },

  // Dati Fiscali
  vat_number: { kind: "input", label: "Partita IVA", required: false },
  tax_code: { kind: "input", label: "Codice fiscale", required: false },
  tax_regime: {
    kind: "select",
    label: "Regime fiscale",
    options: TAX_REGIMES,
    wide: true,
    required: false,
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

  // Dati REA e Finanziari
  rea_office: {
    kind: "input",
    label: "Provincia ufficio REA",
    placeholder: "es. NA",
    required: false,
  },
  rea_number: { kind: "input", label: "Numero REA", required: false },
  share_capital: { kind: "input", label: "Capitale sociale", required: false },
  ateco_code: { kind: "input", label: "Codice ATECO", required: false },
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
  legal_name: "",
  legal_form: "",
  country_code: "IT",

  // Dati fiscali
  vat_number: "",
  tax_code: "",
  tax_regime: "",
  sdi_code: "",
  pec: "",

  // Dati REA
  rea_office: "",
  rea_number: "",
  share_capital: "",
  ateco_code: "",
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
      "legal_name",
      "legal_form",
      "country_code",
      "vat_number",
      "tax_code",
      "tax_regime",
      "sdi_code",
      "pec",
      "rea_office",
      "rea_number",
      "share_capital",
      "ateco_code",
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
  "legal_name",
  "tax_regime",
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
  legal_name: "Ragione sociale",
  legal_form: "Forma giuridica",
  country_code: "Paese",
  vat_number: "Partita IVA",
  tax_code: "Codice fiscale",
  tax_regime: "Regime fiscale",
  sdi_code: "Codice destinatario SDI",
  pec: "PEC aziendale",
  rea_office: "Provincia ufficio REA",
  rea_number: "Numero REA",
  share_capital: "Capitale sociale",
  ateco_code: "Codice ATECO",
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
