import "server-only";

import { cache } from "react";
import type { CurrentUser } from "@/types/auth";
import { authHeaders, serverApi } from "../Services/server-api";
import { handleReadError } from "../Services/errors";

// Utente corrente con le sue aziende.
// Non autenticato -> redirect al login (via handleReadError).
// cache(): più chiamate nella stessa richiesta fanno un solo fetch.
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  try {
    const res = await serverApi.get("/api/user", {
      headers: await authHeaders(),
    });

    const u = res.data.user ?? res.data.data ?? res.data;

    return {
      name: u.name,
      email: u.email,
      avatar: u.avatar ?? null,
      companies: u.companies ?? [],
    };
  } catch (error) {
    handleReadError(error);
  }
});