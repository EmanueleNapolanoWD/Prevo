import * as z from "zod";

/**
 * Trasforma le stringhe vuote in null.
 * Utile per i campi facoltativi inviati da FormData.
 */
const optionalString = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `Non puoi superare ${maxLength} caratteri`)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .optional();

/**
 * VALIDAZIONE DATI AZIENDALI
 */
export const companyFormSchema = z.object({
  // ANAGRAFICA
  name: z
    .string()
    .trim()
    .min(2, "Il nome commerciale deve contenere almeno 2 caratteri")
    .max(150, "Il nome commerciale non può superare 150 caratteri"),

  legal_name: optionalString(255),

  legal_form: optionalString(50),

  // DATI FISCALI
  country_code: z
    .string()
    .trim()
    .length(2, "Il codice paese deve contenere 2 caratteri")
    .regex(/^[A-Za-z]{2}$/, "Inserisci un codice paese valido")
    .transform((value) => value.toUpperCase()),

  vat_number: z
    .string()
    .trim()
    .min(1, "La partita IVA è obbligatoria")
    .max(20, "La partita IVA non può superare 20 caratteri")
    .regex(
      /^[A-Za-z0-9]+$/,
      "La partita IVA può contenere solo lettere e numeri",
    ),

  tax_code: z
    .string()
    .trim()
    .max(16, "Il codice fiscale non può superare 16 caratteri")
    .regex(
      /^[A-Za-z0-9]{0,16}$/,
      "Il codice fiscale può contenere solo lettere e numeri",
    )
    .transform((value) => (value === "" ? null : value.toUpperCase())),

  tax_regime: optionalString(10),

  sdi_code: z
    .string()
    .trim()
    .max(7, "Il codice SDI non può superare 7 caratteri")
    .regex(
      /^(?:[A-Za-z0-9]{6,7})?$/,
      "Il codice SDI deve contenere 6 o 7 caratteri alfanumerici",
    )
    .transform((value) => (value === "" ? null : value.toUpperCase())),

  pec: z
    .string()
    .trim()
    .max(255, "La PEC non può superare 255 caratteri")
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Inserisci un indirizzo PEC valido",
    )
    .transform((value) => (value === "" ? null : value)),

  rea_office: z
    .string()
    .trim()
    .max(2, "La provincia REA non può superare 2 caratteri")
    .regex(/^[A-Za-z]{0,2}$/, "Inserisci una sigla provinciale valida")
    .transform((value) => (value === "" ? null : value.toUpperCase())),

  rea_number: optionalString(20),

  share_capital: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .refine(
      (value) =>
        value === null ||
        (/^\d+(?:[.,]\d{1,2})?$/.test(value) &&
          Number(value.replace(",", ".")) >= 0),
      "Inserisci un capitale sociale valido e non negativo",
    )
    .transform((value) =>
      value === null ? null : Number(value.replace(",", ".")),
    ),

  ateco_code: optionalString(20),

  iban: z
    .string()
    .trim()
    .max(34, "L'IBAN non può superare 34 caratteri")
    .transform((value) => value.replace(/\s/g, "").toUpperCase())
    .refine(
      (value) => value === "" || /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(value),
      "Inserisci un IBAN valido",
    )
    .transform((value) => (value === "" ? null : value)),

  // SEDE LEGALE
  address: z
    .string()
    .trim()
    .min(3, "L'indirizzo deve contenere almeno 3 caratteri")
    .max(255, "L'indirizzo non può superare 255 caratteri"),

  postal_code: z
    .string()
    .trim()
    .length(5, "Il CAP deve contenere 5 cifre")
    .regex(/^\d{5}$/, "Il CAP deve contenere solo cifre"),

  city: z
    .string()
    .trim()
    .min(2, "La città deve contenere almeno 2 caratteri")
    .max(100, "La città non può superare 100 caratteri"),

  province: z
    .string()
    .trim()
    .length(2, "La provincia deve contenere 2 caratteri")
    .regex(/^[A-Za-z]{2}$/, "Inserisci una sigla provinciale valida")
    .transform((value) => value.toUpperCase()),

  // CONTATTI
  email: z
    .string()
    .trim()
    .min(1, "L'email è obbligatoria")
    .max(255, "L'email non può superare 255 caratteri")
    .pipe(z.email("Inserisci un indirizzo email valido")),

  phone: z
    .string()
    .trim()
    .max(30, "Il telefono non può superare 30 caratteri")
    .regex(
      /^[+()\d\s./-]*$/,
      "Il numero di telefono contiene caratteri non validi",
    )
    .transform((value) => (value === "" ? null : value)),

  website: z
    .string()
    .trim()
    .max(255, "Il sito web non può superare 255 caratteri")
    .refine((value) => {
      if (value === "") return true;

      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Inserisci un URL valido che inizi con http:// o https://")
    .transform((value) => (value === "" ? null : value)),
});

/**
 * Tipo TypeScript derivato dallo schema.
 */
export type CompanyFormInput = z.input<typeof companyFormSchema>;

export type CompanyFormData = z.output<typeof companyFormSchema>;