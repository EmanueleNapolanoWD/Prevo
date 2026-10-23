"use server";

import { isAxiosError } from "axios";
import type { Quote, QuotePayload, QuoteSettingsData } from "@/types/quote";
import { serverApi } from "../Services/server-api";
import { authHeaders } from "../Services/server-api";
import { handleReadError } from "../Services/errors";

const companyUrl = (slug: string) =>
  `/api/companies/${encodeURIComponent(slug)}`;

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

export type SendQuoteResult =
  | { ok: true; quote: Quote }
  | {
      ok: false;
      status: number | null;
      message: string;
      /** Errori 422 di Laravel, con chiavi tipo "title" o "items.0.quantity". */
      fieldErrors?: Record<string, string[]>;
    };

// invio payload per creare un preventivo
export async function sendPayloadQuote(
  slug: string,
  data: QuotePayload,
): Promise<SendQuoteResult> {
  console.log("payload quote: ", data);
  try {
    const res = await serverApi.post(`${companyUrl(slug)}/quotes`, data, {
      headers: await authHeaders(),
    });

    return { ok: true, quote: res.data.data ?? res.data };
  } catch (error) {
    console.error("errore: ", error);
    return toQuoteError(error);
  }
}

function toQuoteError(error: unknown): SendQuoteResult {
  if (!isAxiosError(error)) {
    return { ok: false, status: null, message: "Errore imprevisto. Riprova." };
  }

  const status = error.response?.status ?? null;
  const body = error.response?.data as
    | { message?: string; errors?: Record<string, string[]> }
    | undefined;

  switch (status) {
    case 401:
      return {
        ok: false,
        status,
        message: "Sessione scaduta: accedi di nuovo.",
      };
    case 403:
      return {
        ok: false,
        status,
        message: "Non hai i permessi per creare preventivi in questa azienda.",
      };
    case 404:
      return { ok: false, status, message: "Azienda o cliente non trovati." };
    case 422:
      return {
        ok: false,
        status,
        message: body?.message ?? "Controlla i dati inseriti.",
        fieldErrors: body?.errors,
      };
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
            : "Impossibile creare il preventivo.",
      };
  }
}
