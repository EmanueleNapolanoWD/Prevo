import * as z from "zod";

// VALIDAZIONE LOGIN
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'email è obbligatoria")
    .email("Inserisci un indirizzo email valido"),

  password: z.string().min(1, "La password è obbligatoria"),
});

// VALIDAZIONE REGISTRAZIONE
export const registerSchema = z
  .object({
    // Account personale
    name: z.string().trim().min(1, "Inserisci il nome").max(255),
    surname: z.string().trim().min(1, "Inserisci il cognome").max(255),

    email: z
      .string()
      .trim()
      .email("Email personale non valida")
      .max(255),

    password: z.string().min(8, "Minimo 8 caratteri"),
    password_confirmation: z
      .string()
      .min(1, "Conferma la password"),

    // Anagrafica aziendale
    company_name: z
      .string()
      .trim()
      .min(1, "Inserisci il nome azienda")
      .max(150),

    legal_name: z
      .string()
      .trim()
      .min(1, "Inserisci la ragione sociale")
      .max(255),

    legal_form: z
      .string()
      .max(30, "Massimo 30 caratteri"),

    // Dati fiscali
    country_code: z
      .string()
      .trim()
      .length(2, "Inserisci il codice paese di 2 lettere")
      .transform((value) => value.toUpperCase()),

    vat_number: z
      .string()
      .trim()
      .min(1, "Inserisci la partita IVA")
      .max(20),

    tax_code: z
      .string()
      .trim()
      .min(1, "Inserisci il codice fiscale")
      .max(20),

    tax_regime: z
      .string()
      .max(4, "Massimo 4 caratteri"),

    sdi_code: z
      .string()
      .trim()
      .max(7, "Massimo 7 caratteri"),

    pec: z.union([
      z.literal(""),
      z.string().trim().email("Inserisci una PEC valida").max(255),
    ]),

    // Dati REA
    rea_office: z
      .string()
      .trim()
      .max(2, "Massimo 2 caratteri")
      .transform((value) => value.toUpperCase()),

    rea_number: z
      .string()
      .trim()
      .max(20, "Massimo 20 caratteri"),

    // Capitale sociale: stringa vuota oppure importo numerico non negativo
    share_capital: z.union([
      z.literal(""),
      z
        .string()
        .trim()
        .regex(
          /^\d{1,10}([.,]\d{1,2})?$/,
          "Inserisci un importo valido, con massimo 2 decimali",
        ),
    ]),

    ateco_code: z
      .string()
      .trim()
      .max(10, "Massimo 10 caratteri"),

    iban: z
      .string()
      .trim()
      .max(34, "Massimo 34 caratteri"),

    // Sede legale
    address: z
      .string()
      .trim()
      .min(1, "Inserisci l'indirizzo")
      .max(255),

    postal_code: z
      .string()
      .trim()
      .min(1, "Inserisci il CAP")
      .max(10),

    city: z
      .string()
      .trim()
      .min(1, "Inserisci la città")
      .max(100),

    province: z
      .string()
      .trim()
      .length(2, "Usa la sigla di 2 lettere")
      .transform((value) => value.toUpperCase()),

    // Contatti aziendali
    company_email: z
      .string()
      .trim()
      .email("Email aziendale non valida")
      .max(255),

    phone: z
      .string()
      .trim()
      .min(1, "Inserisci il telefono")
      .max(30),

    website: z.union([
      z.literal(""),
      z.string().trim().url("Inserisci un URL valido").max(255),
    ]),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Le password non coincidono",
    path: ["password_confirmation"],
  });

// TYPESCRIPT TYPES
export type SignUpFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;