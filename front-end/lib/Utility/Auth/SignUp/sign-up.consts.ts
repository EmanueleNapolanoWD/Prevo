import { SignUpFormValues } from "@/lib/Validations/auth";
import { SelectOption, StepConfig } from "@/types/Auth/signup.type";
import { MapPin, User, Building2, Receipt, FileText } from "lucide-react";

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


// Codici RegimeFiscale di FatturaPA: verificali sulle specifiche ufficiali
// dell'Agenzia delle Entrate prima di andare in produzione.
export const TAX_REGIMES: SelectOption[] = [
  { value: "", label: "Seleziona il regime fiscale" },
  { value: "RF01", label: "RF01 - Ordinario" },
  { value: "RF02", label: "RF02 - Contribuenti minimi" },
  { value: "RF04", label: "RF04 - Agricoltura" },
  { value: "RF05", label: "RF05 - Vendita sali e tabacchi" },
  {
    value: "RF06",
    label: "RF06 - Gestione di servizi di telefonia pubblica",
  },
  {
    value: "RF07",
    label: "RF07 - Rivendita documenti di trasporto pubblico",
  },
  { value: "RF08", label: "RF08 - Editoria" },
  {
    value: "RF09",
    label: "RF09 - Attività di intrattenimento e giochi",
  },
  { value: "RF10", label: "RF10 - Agenzie di viaggi" },
  { value: "RF11", label: "RF11 - Agriturismo" },
  { value: "RF12", label: "RF12 - Vendite a domicilio" },
  {
    value: "RF13",
    label: "RF13 - Beni usati e altri casi speciali",
  },
  {
    value: "RF14",
    label: "RF14 - Agenzie di vendite all'asta",
  },
  { value: "RF15", label: "RF15 - IVA per cassa" },
  { value: "RF16", label: "RF16 - Altri casi particolari" },
  { value: "RF17", label: "RF17 - IVA per cassa (PA)" },
  { value: "RF18", label: "RF18 - Altro" },
  { value: "RF19", label: "RF19 - Regime forfettario" },
];

export const STEPS: StepConfig[] = [
  {
    id: "account",
    title: "Account",
    heading: "Il tuo account",
    description: "I dati con cui accederai a PREVO.",
    icon: User,
    fields: ["name", "surname", "email", "password", "password_confirmation"],
  },
  {
    id: "company",
    title: "Azienda",
    heading: "Anagrafica aziendale",
    description: "Come si chiama e come è costituita la tua attività.",
    icon: Building2,
    fields: ["company_name", "legal_name", "legal_form", "country_code"],
  },
  {
    id: "fiscal",
    title: "Fiscale",
    heading: "Dati fiscali",
    description: "Servono per intestare correttamente i tuoi preventivi.",
    icon: Receipt,
    fields: ["vat_number", "tax_code", "tax_regime", "sdi_code", "pec"],
  },
  {
    id: "rea",
    title: "REA",
    heading: "Dati REA e societari",
    description: "Sono facoltativi: puoi completarli anche in seguito.",
    icon: FileText,
    fields: ["rea_office", "rea_number", "share_capital", "ateco_code", "iban"],
    optional: true,
  },
  {
    id: "address",
    title: "Sede",
    heading: "Sede legale e contatti",
    description: "Dove e come ti trovano i tuoi clienti.",
    icon: MapPin,
    fields: [
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
  "tax_regime",
  "iban",
  "address",
]);

export const FIELD_LABELS: Partial<Record<keyof SignUpFormValues, string>> = {
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

// Campi che appartengono davvero a un passo del form
export const FORM_FIELDS = new Set<string>(STEPS.flatMap((s) => s.fields));
