import "server-only";

import { serverApi, authHeaders } from "../Services/server-api";
import type { CompanyValues, UpdateCompanyResult } from "@/types/company";
import { handleReadError, toApiFailure } from "../Services/errors";

const companyUrl = (slug: string) =>
  `/api/companies/${encodeURIComponent(slug)}`;

type UpdateCompanyOptions = {
  logo?: File | null;
  removeLogo?: boolean;
};

//==================COMPANY

// recupero company
export async function getCompany(slug: string): Promise<CompanyValues> {
  try {
    const res = await serverApi.get(companyUrl(slug), {
      headers: await authHeaders(),
    });

    return res.data.data ?? res.data;
  } catch (error) {
    handleReadError(error);
  }
}

// aggiornamento dati company (multipart, per poter inviare anche il logo)
export async function updateCompany(
  slug: string,
  payload: Record<string, string | null>,
  { logo = null, removeLogo = false }: UpdateCompanyOptions = {},
): Promise<UpdateCompanyResult> {
  try {
    const body = new FormData();

    // Laravel non legge il multipart su una richiesta PUT: si invia POST
    // con method spoofing, la route resta definita come PUT
    body.append("_method", "PUT");

    for (const [key, value] of Object.entries(payload)) {
      // FormData non ha null: le stringhe vuote diventano null lato Laravel
      // grazie a ConvertEmptyStringsToNull
      body.append(key, value ?? "");
    }

    if (logo) body.append("logo", logo);
    if (removeLogo) body.append("remove_logo", "1");

    const res = await serverApi.post(companyUrl(slug), body, {
      // nessun Content-Type manuale: il boundary lo imposta axios.
      // Se serverApi ha application/json come default, aggiungi qui
      // "Content-Type": "multipart/form-data" solo per questa chiamata.
      headers: await authHeaders(),
    });

    // se il backend restituisce il nuovo slug, l'action reindirizza lì
    const data = res.data?.data ?? res.data;

    return { ok: true, slug: data?.slug };
  } catch (error) {
    console.error(error);
    return toApiFailure(error);
  }
}