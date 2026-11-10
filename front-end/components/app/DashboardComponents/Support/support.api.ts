/**
 * Chiamata API per l'invio di una richiesta di supporto.
 * Nota: l'endpoint backend (POST /api/supporto) non è ancora implementato.
 * Vedere il riepilogo finale per l'integrazione necessaria.
 */

const SUPPORT_URL = "/api/supporto";

export type SupportApiResult =
  | { ok: true }
  | { ok: false; message?: string; errors?: Record<string, string[]> };

function xsrfHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : "";
  return token ? { "X-XSRF-TOKEN": token } : {};
}

export async function sendSupportRequest(payload: {
  email: string;
  subject: string;
  message: string;
}): Promise<SupportApiResult> {
  try {
    const res = await fetch(SUPPORT_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...xsrfHeader(),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (res.ok) return { ok: true };

    let message = "";
    let errors: Record<string, string[]> | undefined;

    try {
      const data = (await res.json()) as {
        message?: string;
        errors?: Record<string, string[]>;
      };
      message = data.message ?? "";
      errors = data.errors;
    } catch {
      // corpo non JSON: ignoro
    }

    if (res.status === 429) {
      return {
        ok: false,
        message: "Troppe richieste. Riprova tra qualche minuto.",
      };
    }
    if (res.status >= 500) {
      return { ok: false, message: "Errore del server. Riprova più tardi." };
    }
    if (res.status === 0) {
      return {
        ok: false,
        message: "Server non raggiungibile. Controlla la connessione.",
      };
    }

    return {
      ok: false,
      message:
        message ||
        "Invio non riuscito. Controlla i campi evidenziati e riprova.",
      errors,
    };
  } catch {
    return { ok: false, message: "Errore imprevisto durante l'invio." };
  }
}
