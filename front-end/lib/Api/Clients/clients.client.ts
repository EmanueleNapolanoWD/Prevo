import type { GetClientResult } from "@/lib/Utility/Clients/clients.types";
import type { ApiErrorResult, ClientsFilters } from "./clients.server";
import { api } from "../Services/api";

const clientsEndpoint = (slug: string) =>
  `/api/companies/${encodeURIComponent(slug)}/clients`;

/**
 * Ricerca clienti per l'autocompletamento.
 * Restituisce la stessa forma di getClients (dati oppure { ok: false, message }).
 * Passando un AbortSignal si può annullare la richiesta quando l'utente digita
 * ancora: in quel caso la funzione lancia AbortError e il chiamante lo ignora.
 */
export async function searchClients(
  slug: string,
  filters: ClientsFilters = {},
  signal?: AbortSignal,
): Promise<GetClientResult> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.tipo) params.set("tipo", filters.tipo);
  if (filters.page) params.set("page", String(filters.page));

  try {
    const res = await api.get(`${clientsEndpoint(slug)}?${params}`, {
      signal,
      headers: { Accept: "application/json" },
    });

    if (res.status < 200 || res.status >= 300) {
      console.error("errore: ", res.data);
      const failure: ApiErrorResult = {
        ok: false,
        status: res.status,
        message:
          res.status === 404
            ? "Risorsa non trovata."
            : `Errore ${res.status}. Riprova.`,
        errors: undefined,
      };
      return failure;
    }

    // Il route handler risponde con JSON anche negli errori ({ ok: false, message })
    return res.data as GetClientResult;
  } catch (error) {
    console.error("errore: ", error);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    const failure: ApiErrorResult = {
      ok: false,
      status: undefined,
      message: "Errore di rete. Riprova.",
      errors: undefined,
    };
    return failure;
  }
}
