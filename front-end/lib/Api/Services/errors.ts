import "server-only";

import { isAxiosError } from "axios";
import { forbidden, notFound, redirect } from "next/navigation";

export type ApiFailure = {
  ok: false;
  status: number; // 0 = server non raggiungibile
  message: string;
  errors?: Record<string, string[]>;
};

const LOGIN_PATH = "/login";

const MESSAGES: Record<number, string> = {
  403: "Non hai i permessi per eseguire questa operazione.",
  404: "Risorsa non trovata.",
  409: "I dati sono cambiati nel frattempo. Ricarica la pagina.",
  422: "Controlla i campi evidenziati.",
  429: "Troppe richieste. Riprova tra qualche istante.",
};

/** Per le scritture: converte l'errore in un oggetto da mostrare nel form. */
export function toApiFailure(error: unknown): ApiFailure {
  if (!isAxiosError(error)) throw error; // bug di codice: non nasconderlo

  const status = error.response?.status ?? 0;

  if (status === 401 || status === 419) redirect(LOGIN_PATH);

  return {
    ok: false,
    status,
    message:
      MESSAGES[status] ??
      (status >= 500
        ? "Errore del server. Riprova più tardi."
        : status === 0
          ? "Server non raggiungibile. Controlla la connessione."
          : "Errore imprevisto."),
    errors: error.response?.data?.errors,
  };
}

/** Per le letture: trasforma lo status in navigazione, o rilancia. */
export function handleReadError(error: unknown): never {
  const status = isAxiosError(error) ? error.response?.status : undefined;

  if (status === 401 || status === 419) redirect(LOGIN_PATH);
  if (status === 403) forbidden();
  if (status === 404) notFound();

  throw error; // 429, 5xx, rete -> error.tsx
}