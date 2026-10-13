import "server-only";
import { serverApi } from "./server-api";
import type { AuthUser } from "@/types/auth";
import axios from "axios";

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

    return res.data;
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
