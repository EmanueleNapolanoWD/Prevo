import {
  AuthUser,
  LoginCredentials,
  AuthResponse,
  CurrentUserResponse,
  User,
  RegisterUser,
  SignUpResponse,
} from "@/types/auth";
import { api } from "./api";
import { SignUpFormValues } from "./Validations/auth";

export async function initializeCsrf(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

// SIGN-UP
export async function registerUser(credentials: SignUpFormValues): Promise<SignUpResponse>
{
  await initializeCsrf();

  const response = await api.post("/api/register",credentials);

  return response.data;
}

// Login
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  await initializeCsrf();

  const response = await api.post<AuthResponse>("/api/login", credentials);

  return response.data.user;
}

// Current user
export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<User>("/api/user");

  return response.data;
}

// Logout
export async function logout(): Promise<void> {
  await api.post("/api/logout");
}
