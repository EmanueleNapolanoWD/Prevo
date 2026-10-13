import "server-only";
import type { AuthUser } from "@/types/auth";

export async function getSessionUser(
  cookieHeader: string | null,
): Promise<AuthUser | null> {
  if (!cookieHeader) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user`, {
      headers: {
        cookie: cookieHeader,
        accept: "application/json",
        origin: process.env.FRONTEND_URL!,
        referer: `${process.env.FRONTEND_URL}/`,
      },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      const responseBody = await res.text();

      console.error("[getSessionUser] Errore API", {
        status: res.status,
        statusText: res.statusText,
        body: responseBody,
      });

      return null;
    }
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
}
