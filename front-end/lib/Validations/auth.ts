import * as z from "zod";

// SCHEMA VALIDATION PER LOGIN FORM
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'email è obbligatoria")
    .email("Inserisci un indirizzo di email valido"),

  password: z.string().min(1, "La password è obbligatoria"),
});

//SCHEMA VALIDATION PER REGISTEFORM
export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Inserisci il nome").max(255),
    surname: z.string().trim().min(1, "Inserisci il cognome").max(255),
    email: z.string().trim().email("Email non valida").max(255),
    password: z.string().min(8, "Minimo 8 caratteri"),
    password_confirmation: z.string().min(1, "Conferma la password"),

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
    vat_number: z.string().trim().min(1, "Inserisci la partita IVA").max(20),
    tax_code: z.string().trim().min(1, "Inserisci il codice fiscale").max(20),
    address: z.string().trim().min(1, "Inserisci l'indirizzo").max(255),
    postal_code: z.string().trim().min(1, "Inserisci il CAP").max(10),
    city: z.string().trim().min(1, "Inserisci la città").max(100),
    province: z.string().trim().length(2, "Usa la sigla di 2 lettere"),
    company_email: z
      .string()
      .trim()
      .email("Email aziendale non valida")
      .max(255),
    phone: z.string().trim().min(1, "Inserisci il telefono").max(30),
    website: z.union([
      z.literal(""),
      z.string().url("Inserisci un URL valido"),
    ]),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Le password non coincidono",
    path: ["password_confirmation"],
  });

// EXPORTS
export type SignUpFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;

