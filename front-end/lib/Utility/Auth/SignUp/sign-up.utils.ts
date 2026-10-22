import { SignUpFormValues } from "@/lib/Validations/auth";
import type { ErrorItem, FieldErrors } from "@/types/Auth/signup.type";
import { FORM_FIELDS } from "./sign-up.consts";

export function getAutoComplete(field: keyof SignUpFormValues) {
  switch (field) {
    case "email":
    case "company_email":
      return "email";
    case "password":
    case "password_confirmation":
      return "new-password";
    case "name":
      return "given-name";
    case "surname":
      return "family-name";
    case "phone":
      return "tel";
    default:
      return "off";
  }
}

export function toFieldKey(value: unknown): keyof SignUpFormValues | null {
  return typeof value === "string" && FORM_FIELDS.has(value)
    ? (value as keyof SignUpFormValues)
    : null;
}

export function extractMessages(errors: unknown): string[] {
  if (Array.isArray(errors)) return errors.map(String);

  if (errors && typeof errors === "object") {
    return Object.values(errors).flatMap((value) =>
      Array.isArray(value)
        ? value.map(String)
        : typeof value === "string"
          ? [value]
          : [],
    );
  }

  return [];
}

// Trasforma gli errori di validazione del backend (formato Laravel:
// { campo: ["messaggio", ...] }) in errori per campo + elenco per il banner.
export function parseServerErrors(raw: unknown): {
  fieldErrors: FieldErrors;
  items: ErrorItem[];
} {
  const fieldErrors: FieldErrors = {};
  const items: ErrorItem[] = [];

  if (raw && typeof raw === "object") {
    for (const [name, value] of Object.entries(raw)) {
      const messages = Array.isArray(value)
        ? value.map(String)
        : [String(value)];
      const field = toFieldKey(name);

      if (field && messages[0]) fieldErrors[field] = messages[0];
      for (const text of messages) items.push({ field, text });
    }
  }

  return { fieldErrors, items };
}
