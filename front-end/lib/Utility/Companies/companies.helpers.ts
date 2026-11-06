import type {
  CompanyValues,
  CompanyFormState,
  ContactItem,
  AddressItem,
  CompanyAddressType,
} from "@/lib/Utility/Companies/companies.type";

export type FieldErrors = Record<string, string[]>;

// solo campi scalari, email,phone e address sono parsati a aparte
export const COMPANY_FIELDS = [
  "name",
  "legal_name",
  "legal_form",
  "country_code",
  "vat_number",
  "tax_code",
  "tax_regime",
  "sdi_code",
  "pec",
  "rea_office",
  "rea_number",
  "share_capital",
  "ateco_code",
  "iban",
  "website",
] as const;

export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export function readFields(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    COMPANY_FIELDS.map((key) => {
      const value = formData.get(key);
      return [key, typeof value === "string" ? value.trim() : ""];
    }),
  );
}

/* ---------- liste indicizzate: emails[0][value], addresses[1][city]... ---------- */
export function readIndexed(
  formData: FormData,
  key: string,
): Record<string, string>[] {
  const rows = new Map<number, Record<string, string>>();
  const re = new RegExp(`^${key}\\[(\\d+)\\]\\[(\\w+)\\]$`);

  for (const [name, raw] of formData.entries()) {
    const m = name.match(re);
    if (!m || typeof raw !== "string") continue;
    const idx = Number(m[1]);
    rows.set(idx, { ...(rows.get(idx) ?? {}), [m[2]]: raw });
  }

  return [...rows.entries()].sort(([a], [b]) => a - b).map(([, r]) => r);
}

// garantisce un solo predenfinito
export function ensureSinglePrimary<T extends { is_primary: boolean }>(
  items: T[],
): T[] {
  if (items.length === 0) return items;
  const idx = Math.max(
    items.findIndex((i) => i.is_primary),
    0,
  );
  return items.map((i, n) => ({ ...i, is_primary: n === idx }));
}

export function readContacts(
  formData: FormData,
  key: "emails" | "phones",
): ContactItem[] {
  const items = readIndexed(formData, key)
    .map((r) => ({
      id: r.id || null,
      value: (r.value ?? "").trim(),
      is_primary: r.is_primary === "1",
    }))
    .filter((r) => r.value !== ""); // scarta le righe vuote

  return ensureSinglePrimary(items);
}

export function readAddresses(formData: FormData): AddressItem[] {
  const items = readIndexed(formData, "addresses")
    .map((r) => ({
      id: r.id || null,
      type: (r.type || "legal") as CompanyAddressType,
      label: r.label?.trim() || null,
      address: (r.address ?? "").trim(),
      address_extra: r.address_extra?.trim() || null,
      postal_code: (r.postal_code ?? "").trim(),
      city: (r.city ?? "").trim(),
      province: r.province?.trim().toUpperCase() || null,
      country_code: r.country_code || "IT",
      is_primary: r.is_primary === "1",
    }))
    .filter((a) => a.address || a.city || a.postal_code);

  return ensureSinglePrimary(items);
}

/* ---------- logo ---------- */

/** Un input file vuoto arriva come File con size 0. */
export function readLogo(formData: FormData): File | null {
  const entry = formData.get("logo");
  return entry instanceof File && entry.size > 0 ? entry : null;
}

/** Controllo di base; la validazione del contenuto reale resta su Laravel. */
export function validateLogo(file: File | null): string | null {
  if (!file) return null;
  if (!LOGO_TYPES.includes(file.type)) {
    return "Formato non supportato: usa PNG, JPG o WebP.";
  }
  if (file.size > LOGO_MAX_BYTES) return "Il file supera i 2 MB.";
  return null;
}

/* ---------- errori ---------- */

/**
 * Schema e backend usano "company_name", il form usa "name".
 * Gli errori delle liste arrivano come "emails.0.email" (Laravel) o
 * "emails.0.value" (Zod): li porto sull'id dell'input, che è
 * "<lista>.<indice>.<campo>" con "value" per email e telefoni.
 */

export function toFormErrors(errors: FieldErrors = {}): FieldErrors {
  const out: FieldErrors = {};

  for (const [key, messages] of Object.entries(errors)) {
    let target = key;

    if (key === "company_name") target = "name";
    else if (/^emails\.\d+\.email$/.test(key))
      target = key.replace(/\.email$/, ".value");
    else if (/^phones\.\d+\.phone$/.test(key))
      target = key.replace(/\.phone$/, ".value");
    // errore sull'intera lista (es. "almeno un'email"): punto sul primo input
    else if (key === "emails" || key === "phones") target = `${key}.0.value`;
    else if (key === "addresses") target = "addresses.0.address";

    out[target] = [...(out[target] ?? []), ...messages];
  }

  return out;
}

export function readValues(formData: FormData): CompanyValues {
  return {
    ...(readFields(formData) as Partial<CompanyValues>),
    emails: readContacts(formData, "emails"),
    phones: readContacts(formData, "phones"),
    addresses: readAddresses(formData),
  };
}

export function failure(
  message: string,
  errors: FieldErrors,
  values: CompanyValues,
): CompanyFormState {
  return { ok: false, message, errors, values };
}

export function zodIssuesToErrors(
  issues: { path: PropertyKey[]; message: string }[],
): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
