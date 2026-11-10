import { z } from "zod";

export const supportFormSchema = z.object({
  email: z
    .string({ required_error: "L'email è obbligatoria." })
    .email({ message: "Inserisci un indirizzo email valido." }),
  subject: z
    .string({ required_error: "Seleziona un argomento." })
    .min(1, { message: "Seleziona un argomento." }),
  message: z
    .string({ required_error: "Scrivi un messaggio." })
    .min(10, { message: "Il messaggio deve contenere almeno 10 caratteri." })
    .max(2000, { message: "Il messaggio non può superare i 2000 caratteri." }),
});

export type SupportFormValues = z.infer<typeof supportFormSchema>;

export const SUPPORT_SUBJECTS = [
  { value: "account", label: "Account e accesso" },
  { value: "pdf", label: "PDF e invio preventivi" },
  { value: "billing", label: "Abbonamento e fatturazione" },
  { value: "bug", label: "Bug e suggerimenti" },
  { value: "other", label: "Altro" },
] as const;

export type SupportSubject = (typeof SUPPORT_SUBJECTS)[number]["value"];
