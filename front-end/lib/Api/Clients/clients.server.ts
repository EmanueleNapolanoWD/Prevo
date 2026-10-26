import "server-only";

import { isAxiosError } from "axios";
import { authHeaders, serverApi } from "../Services/server-api";
import type { ClientPayload } from "./clients.schema";
import type { GetClientResult } from "@/types/client";

// ============================================================================
// TIPI
// ============================================================================

export type ClientsFilters = { q?: string; tipo?: string; page?: number };

export type ApiErrorResult = ReturnType<typeof toErrorResult>;
export type MutationResult = { ok: true } | ApiErrorResult;

// ============================================================================
// MESSAGGI DI ERRORE
// ============================================================================

const READ_ERRORS = {
  401: "Devi effettuare l'accesso.",
  403: "Non hai i permessi per visualizzare i contatti.",
  404: "Azienda o risorsa non trovata.",
};

const CREATE_ERRORS = {
  403: "Non hai i permessi per creare un contatto.",
  404: "Azienda non trovata.",
};

const UPDATE_ERRORS = {
  403: "Non hai i permessi per modificare il contatto.",
  404: "Azienda o contatto non trovato.",
};

const DELETE_ERRORS = {
  403: "Non hai i permessi per eliminare il contatto.",
  404: "Azienda o contatto non trovato.",
};

// ============================================================================
// HELPER
// ============================================================================

function toErrorResult(
  error: unknown,
  messages: Partial<Record<number, string>>,
) {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    return {
      ok: false as const,
      message:
        (status && messages[status]) ||
        error.response?.data?.message ||
        `Errore ${status ?? "di rete"}. Riprova.`,
      errors: status === 422 ? error.response?.data?.errors : undefined,
    };
  }

  return {
    ok: false as const,
    message: "Errore imprevisto. Riprova tra qualche istante.",
  };
}

const clientsUrl = (slug: string, clientId?: string) =>
  `/api/companies/${slug}/clients${clientId ? `/${clientId}` : ""}`;

// ============================================================================
// CHIAMATE AL BACKEND
// ============================================================================

export async function getClients(
  slug: string,
  filters: ClientsFilters = {},
): Promise<GetClientResult> {
  try {
    const res = await serverApi.get(clientsUrl(slug), {
      headers: await authHeaders(),
      params: {
        q: filters.q || undefined,
        tipo: filters.tipo || undefined,
        page: filters.page || undefined,
      },
    });
    return res.data;
  } catch (error) {
    return toErrorResult(error, READ_ERRORS);
  }
}

export async function getClientById(slug: string, clientId: string) {
  try {
    const res = await serverApi.get(clientsUrl(slug, clientId), {
      headers: await authHeaders(),
    });
    return res.data.data;
  } catch (error) {
    console.error("errore getClientById: ", error);
    return toErrorResult(error, READ_ERRORS);
  }
}

export async function createClient(
  slug: string,
  payload: ClientPayload,
): Promise<MutationResult> {
  try {
    await serverApi.post(clientsUrl(slug), payload, {
      headers: await authHeaders(),
    });
    return { ok: true };
  } catch (error) {
    return toErrorResult(error, CREATE_ERRORS);
  }
}

export async function updateClient(
  slug: string,
  clientId: string,
  payload: ClientPayload,
): Promise<MutationResult> {
  try {
    await serverApi.put(clientsUrl(slug, clientId), payload, {
      headers: await authHeaders(),
    });
    return { ok: true };
  } catch (error) {
    return toErrorResult(error, UPDATE_ERRORS);
  }
}

export async function deleteClient(
  slug: string,
  clientId: string,
): Promise<MutationResult> {
  try {
    await serverApi.delete(clientsUrl(slug, clientId), {
      headers: await authHeaders(),
    });
    return { ok: true };
  } catch (error) {
    return toErrorResult(error, DELETE_ERRORS);
  }
}
