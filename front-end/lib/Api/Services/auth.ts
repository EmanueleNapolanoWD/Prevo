
import {
  AuthUser,
  LoginCredentials,
  AuthResponse,
  SignUpResponse,
} from "@/types/auth";
import { api } from "../api";
import { SignUpFormValues } from "../../Validations/auth";
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

// Trasforma qualsiasi errore di rete/HTTP in un AuthError con messaggi per l'utente
function toAuthError(
  error: unknown,
  messages: { invalid: string; fallback: string },
): AuthError {
  if (isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401 || status === 422) {
      return new AuthError(
        messages.invalid,
        status,
        error.response?.data?.errors,
      );
    }
    if (status === 419) {
      return new AuthError(
        "Sessione scaduta. Ricarica la pagina e riprova.",
        status,
      );
    }
    if (status === 429) {
      return new AuthError(
        "Troppi tentativi. Riprova tra qualche minuto.",
        status,
      );
    }
  }
  return new AuthError(messages.fallback);
}

export async function initializeCsrf(): Promise<void> {
  const csrf = await api.get("/sanctum/csrf-cookie");

  console.log("csrf token: ", csrf);
}

// SIGN-UP
export async function registerUser(
  credentials: SignUpFormValues,
): Promise<SignUpResponse> {
  try {
    await initializeCsrf();
    const { data } = await api.post<SignUpResponse>(
      "/api/register",
      credentials,
    );
    return data;
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
    await initializeCsrf();
    const { data } = await api.post<AuthResponse>("/api/login", credentials);
    return data.user;
  } catch (error) {
    throw toAuthError(error, {
      invalid: "Email o password non corrette.",
      fallback: "Impossibile effettuare l'accesso. Riprova più tardi.",
    });
  }
}

// CURRENT USER: null se non autenticato
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data } = await api.get<AuthUser>("/api/user");
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) return null;
    throw error;
  }
}

// FORGOTPASSWORD
export async function forgotPassword(email: string): Promise<void> {
  try {
    await initializeCsrf();
    await api.post("/api/forgot-password", { email });
  } catch (error) {
    throw toAuthError(error, {
      invalid: "Inserisci un indirizzo email valido.",
      fallback: "Impossibile inviare la richiesta. Riprova più tardi.",
    });
  }
}

// Reset Password
export async function resetPassword(data: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  try {
    await initializeCsrf();

    await api.post("/api/reset-password", {
      token: data.token,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
    });
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
