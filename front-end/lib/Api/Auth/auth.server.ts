import "server-only";

import { cache } from "react";
import type { CurrentUser } from "@/lib/Utility/Auth/auth.types";
import { authHeaders, serverApi } from "../Services/server-api";
import { handleReadError } from "../Services/errors";
import type { AuthUser } from "@/lib/Utility/Auth/auth.types";
import axios from "axios";

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

// recupero utente tramite header dei cookie (in middleware o contesti specifici)
export async function getSessionUser(
  cookieHeader: string | null,
): Promise<AuthUser | null> {
  if (!cookieHeader) return null;

  try {
    const res = await serverApi.get("/api/user", {
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (res.status !== 200) return null;

    return res.data.user;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[getSessionUser]", {
        status: error.response?.status,
        message: error.message,
      });
    } else {
      console.error("[getSessionUser] Errore inatteso", error);
    }
    return null;
  }
}
