"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateCompany } from "./company.server";
import type { CompanyValues, CompanyFormState } from "@/types/company";
import { companyFormSchema } from "./company.schema";

const FIELDS = [
  "name",
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
  "email",
  "phone",
  "website",
] as const;

const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/** Controllo di base sul file; la validazione vera (contenuto reale) resta su Laravel. */
function validateLogo(file: File | null): string | null {
  if (!file) return null;

  if (!LOGO_TYPES.includes(file.type)) {
    return "Formato non supportato: usa PNG, JPG o WebP.";
  }

  if (file.size > LOGO_MAX_BYTES) {
    return "Il file supera i 2 MB.";
  }

  return null;
}

/** Il form usa "name", schema e backend usano "company_name": riallinea le chiavi degli errori. */
function toFormErrors(
  errors?: Record<string, string[]>,
): Record<string, string[]> {
  const mapped = { ...(errors ?? {}) };

  if (mapped.company_name) {
    mapped.name = mapped.company_name;
    delete mapped.company_name;
  }

  return mapped;
}

export async function updateCompanyDataAction(
  slug: string,
  _prev: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  // recupero dati testuali dal form
  const values: Record<string, string | null> = {};

  for (const key of FIELDS) {
    const field = formData.get(key);

    values[key] = typeof field === "string" ? field.trim() : "";
  }

  // logo: un input file vuoto arriva come File con size 0
  const logoEntry = formData.get("logo");
  const logo =
    logoEntry instanceof File && logoEntry.size > 0 ? logoEntry : null;
  const removeLogo = formData.get("remove_logo") === "1" && !logo;

  // il form usa "name", il backend "company_name"
  const payload = { ...values };

  // validazione dei dati tramite ZOD
  const validation = companyFormSchema.safeParse(payload);

  if (!validation.success) {
    console.error(
      "Errori validazione Zod:",
      validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    );
  }
  const logoError = validateLogo(logo);
  if (logoError) console.error("Errore logo:", logoError);

  if (!validation.success || logoError) {
    // flatten() include solo i campi che hanno errori
    const flat = validation.success ? null : validation.error.flatten();
    const errors = toFormErrors(
      (flat?.fieldErrors as Record<string, string[]> | undefined) ?? {},
    );

    if (logoError) errors.logo = [logoError];

    return {
      ok: false,
      message: flat?.formErrors[0] ?? "Controlla i campi evidenziati.",
      errors,
      // valori con la chiave "name", come si aspetta il form
      values: values as CompanyValues,
    };
  }

  // invio i dati validati e normalizzati da Zod, più l'eventuale logo
  const result = await updateCompany(
    slug,
    validation.data as Record<string, string | null>,
    { logo, removeLogo },
  );

  if (!result.ok) {
    console.error("Errore backend:", JSON.stringify(result, null, 2));
    return {
      ok: false,
      message: result.message,
      errors: toFormErrors(result.errors),
      values: values as CompanyValues,
    };
  }

  // if (!result.ok) {
  //   return {
  //     ok: false,
  //     message: result.message,
  //     errors: toFormErrors(result.errors),
  //     values: values as CompanyValues,
  //   };
  // }

  // Recupera lo slug aggiornato dal backend
  const newSlug = result.slug ?? slug;

  // Invalida la cache del percorso precedente
  revalidatePath(`/${slug}/settings`);

  // Invalida anche il percorso nuovo, se lo slug è cambiato
  if (newSlug !== slug) {
    revalidatePath(`/${newSlug}/settings`);
  }

  // Reindirizza al nuovo URL
  redirect(`/${newSlug}`);
}
