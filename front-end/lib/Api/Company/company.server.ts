import "server-only";

import { serverApi, authHeaders } from "../Services/server-api";
import type {
  UpdateCompanyResult,
  Company,
} from "@/lib/Utility/Companies/companies.type";
import type { CompanyFormData } from "@/lib/Validations/company.schema";
import { handleReadError, toApiFailure } from "../Services/errors";

const companyUrl = (slug: string) =>
  `/api/companies/${encodeURIComponent(slug)}`;

/** Appiattisce oggetti e array nelle chiavi Laravel: emails[0][email]. */
function appendValue(fd: FormData, key: string, value: unknown): void {
  if (value === undefined) return;

  if (Array.isArray(value)) {
    value.forEach((v, i) => appendValue(fd, `${key}[${i}]`, v));
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value))
      appendValue(fd, `${key}[${k}]`, v);
    return;
  }
  if (typeof value === "boolean") {
    fd.append(key, value ? "1" : "0");
    return;
  }
  // FormData non ha null: "" diventa null lato Laravel (ConvertEmptyStringsToNull)
  fd.append(key, value == null ? "" : String(value));
}

type UpdateCompanyOptions = {
  logo?: File | null;
  removeLogo?: boolean;
};

//==================COMPANY

// recupero company
export async function fetchCompany(slug: string): Promise<Company> {
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
  payload: CompanyFormData,
  { logo = null, removeLogo = false }: UpdateCompanyOptions = {},
): Promise<UpdateCompanyResult> {
  try {
    const body = new FormData();

    // Laravel non legge il multipart su una richiesta PUT: si invia POST
    // con method spoofing, la route resta definita come PUT
    body.append("_method", "PUT");

    const { emails, phones, addresses, ...scalars } = payload;

    for (const [key, value] of Object.entries(scalars)) {
      appendValue(body, key, value);
    }

    // il form usa value, le collonne si chiamano email/phone
    appendValue(
      body,
      "emails",
      emails.map((e) => ({
        ...(e.id ? { id: e.id } : {}),
        email: e.value,
        is_primary: e.is_primary,
      })),
    );
    appendValue(
      body,
      "phones",
      phones.map((p) => ({
        ...(p.id ? { id: p.id } : {}),
        phone: p.value,
        is_primary: p.is_primary,
      })),
    );
    appendValue(
      body,
      "addresses",
      addresses.map(({ id, ...rest }) => ({ ...(id ? { id } : {}), ...rest })),
    );

    // un array vuoto non produce chiavi nel multipart: questo dice a Laravel
    // quali liste sincronizzare, anche quando l'utente le ha svuotate
    for (const list of ["emails", "phones", "addresses"]) {
      body.append("sync_lists[]", list);
    }

    if (logo) body.append("logo", logo);
    if (removeLogo) body.append("remove_logo", "1");

    const res = await serverApi.post(companyUrl(slug), body, {
      // nessun Content-Type manuale: il boundary lo imposta axios.
      // Se serverApi ha application/json come default, aggiungi qui
      // "Content-Type": "multipart/form-data" solo per questa chiamata.
      headers: {
        ...(await authHeaders()),
        "Content-Type": "multipart/form-data",
      },
    });

    // se il backend restituisce il nuovo slug, l'action reindirizza lì
    const data = res.data?.data ?? res.data;

    return { ok: true, slug: data?.slug };
  } catch (error) {
    console.error(error);
    return toApiFailure(error);
  }
}
