"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import * as clientsApi from "./clients.server";
import type { ClientsFilters } from "./clients.server";
import type { ClientPayload } from "./clients.schema";
import type { ClientActionResult } from "@/components/app/DashboardComponents/Clients/ClientForm/hooks/useClientForm";

// ============================================================================
// LETTURA
// ============================================================================

export async function getClients(slug: string, filters: ClientsFilters = {}) {
  return clientsApi.getClients(slug, filters);
}

export async function getClientById(slug: string, clientId: string) {
  return clientsApi.getClientById(slug, clientId);
}

// ============================================================================
// SCRITTURA
// ============================================================================

export async function createClient(
  slug: string,
  payload: ClientPayload,
): Promise<ClientActionResult> {
  const res = await clientsApi.createClient(slug, payload);
  if (!res.ok) return res;

  revalidatePath(`/${slug}/clients`);
  redirect(`/${slug}/clients`);
}

export async function updateClient(
  slug: string,
  clientId: string,
  payload: ClientPayload,
): Promise<ClientActionResult> {
  const res = await clientsApi.updateClient(slug, clientId, payload);
  if (!res.ok) return res;

  revalidatePath(`/${slug}/clients`);
  revalidatePath(`/${slug}/clients/${clientId}`);
  redirect(`/${slug}/clients`);
}

export async function deleteClient(
  slug: string,
  clientId: string,
): Promise<ClientActionResult> {
  const res = await clientsApi.deleteClient(slug, clientId);
  if (!res.ok) return res;

  revalidatePath(`/${slug}/clients`);
  return { ok: true };
}