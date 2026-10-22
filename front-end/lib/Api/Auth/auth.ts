import { isAxiosError } from "axios";
import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  SignUpResponse,
} from "@/types/auth";
import type { SignUpFormValues } from "../../Validations/auth";
import { api } from "../Services/api";

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

type ErrorMessages = { invalid: string; fallback: string };

// Trasforma qualsiasi errore di rete/HTTP in un AuthError con messaggi per l'utente
function toAuthError(error: unknown, messages: ErrorMessages): AuthError {
  if (!isAxiosError(error)) return new AuthError(messages.fallback);

  // nessuna risposta: server spento o rete assente
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

export async function initializeCsrf(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

// POST con cookie CSRF di Sanctum
async function postWithCsrf<T>(url: string, body?: unknown): Promise<T> {
  await initializeCsrf();
  const { data } = await api.post<T>(url, body);
  return data;
}

// SIGN-UP
export async function registerUser(
  credentials: SignUpFormValues,
): Promise<SignUpResponse> {
  try {
    return await postWithCsrf<SignUpResponse>("/api/register", credentials);
  } catch (error) {
    throw toAuthError(error, {
      invalid: "Controlla i dati inseriti.",
      fallback: "Impossibile completare la registrazione. Riprova più tardi.",
    });
  }
}

// LOGIN
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  try {
    const data = await postWithCsrf<AuthResponse>("/api/login", credentials);
    return data.user;
  } catch (error) {
    throw toAuthError(error, {
      invalid: "Email o password non corrette.",
      fallback: "Impossibile effettuare l'accesso. Riprova più tardi.",
    });
  }
}

// FORGOT PASSWORD
export async function forgotPassword(email: string): Promise<void> {
  try {
    await postWithCsrf("/api/forgot-password", { email });
  } catch (error) {
    throw toAuthError(error, {
      invalid: "Inserisci un indirizzo email valido.",
      fallback: "Impossibile inviare la richiesta. Riprova più tardi.",
    });
  }
}

// RESET PASSWORD
export async function resetPassword(data: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  try {
    await postWithCsrf("/api/reset-password", data);
  } catch (error) {
    throw toAuthError(error, {
      invalid: "Il link non è valido o è scaduto. Richiedine uno nuovo.",
      fallback: "Impossibile reimpostare la password. Riprova più tardi.",
    });
  }
}

// LOGOUT
export async function logout(): Promise<void> {
  try {
    await api.post("/api/logout");
  } catch (error) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    // 401/419: sessione già scaduta, l'utente è di fatto disconnesso
    if (status !== 401 && status !== 419) throw error;
  }
}
