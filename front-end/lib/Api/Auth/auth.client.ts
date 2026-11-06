import { isAxiosError } from "axios";
import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  SignUpResponse,
} from "@/lib/Utility/Auth/auth.types";
import { api } from "../Services/api";
import { RegisterPayload } from "@/lib/Utility/Auth/SignUp/sign-up.types";
import { toAuthError } from "./auth.errors";

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
  credentials: RegisterPayload,
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
