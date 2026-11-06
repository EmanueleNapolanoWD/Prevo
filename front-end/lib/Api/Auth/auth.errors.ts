import { isAxiosError } from "axios";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

type ErrorMessage = { invalid: string; fallback: string };

export function toAuthError(error: unknown, messages: ErrorMessage): AuthError {
  if (!isAxiosError(error)) return new AuthError(messages.fallback);

  if (!error.response) {
    return new AuthError("Server non raggiungibile. Controlla la connessione.");
  }

  const { status, data } = error.response;

  switch (status) {
    case 401:
    case 422:
      return new AuthError(messages.invalid, status, data?.errors);
    case 403:
      return new AuthError(data?.message ?? "Accesso non consentito.", status);
    case 419:
      return new AuthError(
        "Sessione scaduta. Ricarica la pagina e riprova.",
        status,
      );
    case 429:
      return new AuthError(
        "Troppi tentativi. Riprova tra qualche minuto.",
        status,
      );
    default:
      return new AuthError(messages.fallback, status);
  }
}
