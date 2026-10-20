import { isAxiosError } from "axios";

export type ApiError = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export function toErrorResult(
  error: unknown,
  messages: Partial<Record<number, string>> = {},
): ApiError {
  if (isAxiosError(error)) {
    const status = error.response?.status;

    return {
      ok: false,
      message:
        (status && messages[status]) ||
        error.response?.data?.message ||
        `Errore ${status ?? "di rete"}. Riprova.`,
      errors: status === 422 ? error.response?.data?.errors : undefined,
    };
  }

  return {
    ok: false,
    message: "Errore imprevisto. Riprova più tardi",
  };
}
