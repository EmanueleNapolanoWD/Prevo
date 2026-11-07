import type { GetClientResult } from "@/lib/Utility/Clients/clients.types";
import type { ApiErrorResult, ClientsFilters } from "./clients.server";

const clientsEndpoint = (slug: string) =>
  `api/clients/${encodeURIComponent(slug)}`;

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
    const res = await fetch(`${clientsEndpoint(slug)}?${params}`, {
      signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    // Il route handler risponde con JSON anche negli errori ({ ok: false, message })
    return (await res.json()) as GetClientResult;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    const failure: ApiErrorResult = {
      ok: false,
      message: "Errore di rete. Riprova.",
    };
    return failure;
  }
}
