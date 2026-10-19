"use server";

import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authHeaders, serverApi } from "../Services/server-api";
import type { ClientPayload } from "./clients.schema";
import type { ClientActionResult } from "@/components/app/DashboardComponents/Clients/ClientForm/hooks/useClientForm";

export async function createClient(
  slug: string,
  payload: ClientPayload,
): Promise<ClientActionResult> {
  console.log("inzio azione con payload: ", payload);
  try {
    await serverApi.post(`/api/companies/${slug}/clients`, payload, {
      headers: await authHeaders(),
    });
  } catch (error) {
    console.error(
      error.response?.status,
      JSON.stringify(error.response?.data?.trace?.slice(0, 6), null, 2),
    );
    if (isAxiosError(error)) {
      return {
        ok: false,
        message:
          error.response?.status === 403
            ? "Non hai i permessi per creare un contatto."
            : error.response?.data?.message,
        errors:
          error.response?.status === 422
            ? error.response.data.errors
            : undefined,
      };
    }
    return {
      ok: false,
      message: "Errore imprevisto. Riprova tra qualche istante.",
    };
  }
  revalidatePath(`/${slug}/clients`);
  redirect(`/${slug}/clients`);
}
