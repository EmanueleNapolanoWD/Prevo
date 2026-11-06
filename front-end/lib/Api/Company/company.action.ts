"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateCompany } from "./company.server";
import {
  failure,
  FieldErrors,
  readLogo,
  readValues,
  toFormErrors,
  validateLogo,
  zodIssuesToErrors,
} from "@/lib/Utility/Companies/companies.helpers";
import { companyFormSchema } from "../../Validations/company.schema";
import type { CompanyFormState } from "@/lib/Utility/Companies/companies.type";

export async function updateCompanyDataAction(
  slug: string,
  _prev: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const values = readValues(formData);
  const logo = readLogo(formData);
  const removeLogo = !logo && formData.get("remove_logo") === "1";

  const validation = companyFormSchema.safeParse(values);
  const logoError = validateLogo(logo);

  if (!validation.success || logoError) {
    const errors: FieldErrors = validation.success
      ? {}
      : toFormErrors(zodIssuesToErrors(validation.error.issues));

    if (logoError) errors.logo = [logoError];

    return failure("Controlla i campi evidenziati", errors, values);
  }

  const result = await updateCompany(slug, validation.data, {
    logo,
    removeLogo,
  });

  if (!result.ok) {
    return failure(
      result.message ?? "Errore durante l'aggiornamento della company.",
      toFormErrors(result.errors),
      values,
    );
  }

  const newSlug = result.slug ?? slug;

  for (const s of new Set([slug, newSlug])) {
    revalidatePath(`/${s}`, "layout");
  }

  redirect(`/${newSlug}`);
}
