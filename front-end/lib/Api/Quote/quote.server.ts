import "server-only";

import { isAxiosError } from "axios";
import type { Quote, QuotePayload, QuoteSettingsData } from "@/types/quote";
import { authHeaders, serverApi } from "../Services/server-api";
import { handleReadError } from "../Services/errors";

// ============================================================================
// URL
// ============================================================================

const companyUrl = (slug: string) =>
  `/api/companies/${encodeURIComponent(slug)}`;

const quotesUrl = (slug: string) => `${companyUrl(slug)}/quotes`;

const quoteUrl = (slug: string, quoteId: string) =>
  `${quotesUrl(slug)}/${encodeURIComponent(quoteId)}`;

// ============================================================================
// Tipi
// ============================================================================
export type ActionError = {
  ok: false;
  status: number | null;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<T> = { ok: true; data: T } | ActionError;

export type PaginatedQuotes = {
  data: Quote[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

// ============================================================================
// Helper
// ============================================================================

// Laravel avvolge le risorse in { data: ... }: restituisce il contenuto
function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

type ErrorMessages = {
  forbidden: string;
  fallback: string;
};

// Converte un errore di scrittura in un risultato leggibile dal form
function toActionError(error: unknown, messages: ErrorMessages): ActionError {
  if (!isAxiosError(error)) {
    console.error("[quotes] errore imprevisto:", error);
    return { ok: false, status: null, message: "Errore imprevisto. Riprova." };
  }

  const status = error.response?.status ?? null;
  const body = error.response?.data as
    | { message?: string; errors?: Record<string, string[]> }
    | undefined;

  if (status === null || status >= 500) {
    console.error(
      "[quotes] errore backend:",
      status,
      body?.message ?? error.message,
    );
  }

  switch (status) {
    case 401:
      return {
        ok: false,
        status,
        message: "Sessione scaduta: accedi di nuovo.",
      };
    case 403:
      return { ok: false, status, message: messages.forbidden };
    case 404:
      return {
        ok: false,
        status,
        message: "Preventivo, azienda o cliente non trovati.",
      };
    case 409:
      // versione obsoleta o stato non modificabile: il messaggio arriva dal backend
      return { ok: false, status, message: body?.message ?? messages.fallback };
    case 422: {
      const firstError = body?.errors
        ? Object.values(body.errors)[0]?.[0]
        : undefined;
      return {
        ok: false,
        status,
        message: firstError ?? body?.message ?? "Controlla i dati inseriti.",
        fieldErrors: body?.errors,
      };
    }
    case 429:
      return {
        ok: false,
        status,
        message: "Troppe richieste: riprova tra qualche secondo.",
      };
    default:
      return {
        ok: false,
        status,
        message:
          status !== null && status >= 500
            ? "Errore del server. Riprova tra poco."
            : messages.fallback,
      };
  }
}
// ============================================================================
// Letture
// ============================================================================

// recupero settaggi company
export async function getQuoteSettings(
  slug: string,
): Promise<QuoteSettingsData> {
  try {
    const res = await serverApi.get(`${companyUrl(slug)}/settings`, {
      headers: await authHeaders(),
    });

    const settings = res.data.data ?? res.data;

    return {
      ...settings,
      default_vat_rate: Number(settings.default_vat_rate),
    };
  } catch (error) {
    handleReadError(error);
  }
}

export async function fetchQuotes(
  slug: string,
  page = 1,
): Promise<PaginatedQuotes> {
  try {
    const res = await serverApi.get<PaginatedQuotes>(
      `${companyUrl(slug)}/quotes`,
      {
        headers: await authHeaders(),
        params: { page },
      },
    );

    return res.data;
  } catch (error) {
    handleReadError(error);
    throw error;
  }
}

export async function fetchQuoteById(
  slug: string,
  quoteId: string,
): Promise<Quote | null> {
  try {
    const res = await serverApi.get(`${companyUrl(slug)}/quotes/${quoteId}`, {
      headers: await authHeaders(),
    });

    return unwrap<Quote>(res.data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    handleReadError(error);
    throw error;
  }
}

// ============================================================================
// Scritture
// ============================================================================

// invio payload per creare un preventivo
export async function createQuote(
  slug: string,
  data: QuotePayload,
): Promise<ActionResult<Quote>> {
  try {
    const res = await serverApi.post(`${companyUrl(slug)}/quotes`, data, {
      headers: await authHeaders(),
    });

    return { ok: true, data: unwrap<Quote>(res.data) };
  } catch (error) {
    return toActionError(error, {
      forbidden: "Non hai i permessi per creare preventivi in questa azienda!",
      fallback: "Impossibile creare preventivo",
    });
  }
}

export async function updateQuote(
  slug: string,
  quoteId: string,
  payload: QuotePayload,
): Promise<ActionResult<Quote>> {
  try {
    const res = await serverApi.put(
      `${companyUrl(slug)}/quotes/${quoteId}`,
      payload,
      {
        headers: await authHeaders(),
      },
    );

    return { ok: true, data: unwrap<Quote>(res.data) };
  } catch (error) {
    console.error(error);
    return toActionError(error, {
      forbidden: "Non hai i permessi per modificare questo preventivo.",
      fallback: "Impossibile salvare le modifiche al preventivo.",
    });
  }
}

export async function deleteQuote(
  slug: string,
  quoteId: string,
): Promise<ActionResult<null>> {
  try {
    await serverApi.delete(quoteUrl(slug, quoteId), {
      headers: await authHeaders(),
    });

    return { ok: true, data: null };
  } catch (error) {
    console.error(error);
    return toActionError(error, {
      forbidden: "Non hai i permessi per eliminare questo preventivo.",
      fallback: "Impossibile eliminare il preventivo.",
    });
  }
}
