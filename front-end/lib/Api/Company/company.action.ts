"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateCompany } from "./company.server";
import { CompanyValues, CompanyFormState } from "@/types/company";
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

export async function updateCompanyDataAction(
  slug: string,
  _prev: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  // recupero dati dal form
  const payload: Record<string, string | null> = {};

  for (const key of FIELDS) {
    const value = formData.get(key);

    payload[key] = typeof value === "string" ? value.trim() : "";
  }

  // validazione dei dati tramite ZOD
  const validation = companyFormSchema.safeParse(payload);

  if (!validation.success) {
    // flatten() include solo i campi che hanno errori
    const { fieldErrors, formErrors } = validation.error.flatten();

    console.log(
      "[ZOD] Errori di validazione:",
      JSON.stringify(
        {
          fieldErrors,
          formErrors,
          issues: validation.error.issues.map((issue) => ({
            field: issue.path.join("."),
            code: issue.code,
            message: issue.message,
            received: issue.path.length
              ? payload[issue.path[0] as keyof typeof payload]
              : undefined,
          })),
        },
        null,
        2,
      ),
    );

    return {
      ok: false,
      message: formErrors[0] ?? "Controlla i campi evidenziati.",
      errors: fieldErrors as Record<string, string[]>,
      values: payload as CompanyValues,
    };
  }

  // invio i dati validati e normalizzati da Zod
  const result = await updateCompany(
    slug,
    validation.data as Record<string, string | null>,
  );

  if (!result.ok) {
    return {
      ok: false,
      message: result.message,
      errors: result.errors,
      values: payload as CompanyValues,
    };
  }

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
