"use server";

import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authHeaders, serverApi } from "../Services/server-api";
import type { ClientPayload } from "./clients.schema";
import type { ClientActionResult } from "@/components/app/DashboardComponents/Clients/ClientForm/hooks/useClientForm";
import type { Client, GetClientResult } from "@/types/client";

type ClientsFilters = { q?: string; tipo?: string; page?: number };

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

// recupera clienti
export async function getClients(
  slug: string,
  filters: ClientsFilters = {},
): Promise<GetClientResult> {
  try {
    const res = await serverApi.get(`/api/companies/${slug}/clients`, {
      headers: await authHeaders(),
      params: {
        q: filters.q || undefined,
        tipo: filters.tipo || undefined,
        page: filters.page || undefined,
      },
    });
    return res.data;
  } catch (error) {
    return toErrorResult(error, {
      401: "Devi effettuare l'accesso.",
      403: "Non hai i permessi per visualizzare i contatti.",
      404: "Azienda o risorsa non trovata.",
    });
  }
}

//recupera cliente
export async function getClientById(slug: string, clientId: string) {
  try {
    const res = await serverApi.get(
      `/api/companies/${slug}/clients/${clientId}`,
      {
        headers: await authHeaders(),
      },
    );

    return res.data;
  } catch (error) {
    console.error("errore: ", error);
    return toErrorResult(error, {
      401: "Devi effettuare l'accesso.",
      403: "Non hai i permessi per visualizzare i contatti.",
      404: "Azienda o risorsa non trovata.",
    });
  }
}

// crea cliente
export async function createClient(
  slug: string,
  payload: ClientPayload,
): Promise<ClientActionResult> {
  try {
    await serverApi.post(`/api/companies/${slug}/clients`, payload, {
      headers: await authHeaders(),
    });
  } catch (error) {
    return toErrorResult(error, {
      403: "Non hai i permessi per creare un contatto.",
      404: "Azienda non trovata.",
    });
  }

  revalidatePath(`/${slug}/clients`);
  redirect(`/${slug}/clients`);
}

// update client
export async function updateClient(
  slug: string,
  clientId: string,
  payload: ClientPayload,
): Promise<ClientActionResult> {
  try {
    await serverApi.put(`/api/companies/${slug}/clients/${clientId}`, payload, {
      headers: await authHeaders(),
    });
  } catch (error) {
    return toErrorResult(error, {
      403: "Non hai i permessi per creare un contatto.",
      404: "Azienda non trovata.",
    });
  }

  revalidatePath(`/${slug}/clients`);
  revalidatePath(`/${slug}/clients/${clientId}`);
  redirect(`/${slug}/clients`);
}

// elimina client
export async function deleteClient(
  slug: string,
  clientId: string,
): Promise<ClientActionResult> {
  try {
    serverApi.delete(`/api/companies/${slug}/clients/${clientId}`, {
      headers: await authHeaders(),
    });
  } catch (error) {
    return toErrorResult(error, {
      403: "Non hai i permessi per creare un contatto.",
      404: "Azienda non trovata.",
    });
  }

  revalidatePath(`/${slug}/clients`);
  return { ok: true };
}
