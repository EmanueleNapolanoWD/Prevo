import z from "zod";

// COSTANTI
export const CLIENT_TYPES = [
  { value: "PERSON", label: "PERSONA" },
  { value: "COMPANY", label: "Azienda" },
] as const;

export const SALUTATIONS = ["Sig.", "Sig.ra", "Coniugi", "Famiglia"] as const;

export const CONTACTS_LABEL = ["Lavoro", "Privato", "Altro"] as const;

export const ADDRESS_TYPES = [
  { value: "BILLING", label: "Fatturazione" },
  { vale: "SHIPPING", label: "Spedizione" },
  { value: "SITE", label: "Cantiere" },
] as const;

// TODO: sostituire con la lista nazioni caricata dall'API
export const COUNTRIES = [
  { code: "IT", name: "Italia" },
  { code: "FR", name: "Francia" },
  { code: "DE", name: "Germania" },
  { code: "ES", name: "Spagna" },
  { code: "CH", name: "Svizzera" },
  { code: "GB", name: "Regno Unito" },
] as const;

export const VAT_RATE_DEFAULT = "default";
export const VAT_RATES = [
  { value: VAT_RATE_DEFAULT, label: "Aliquota azienda" },
  { value: "22", label: "22%" },
  { value: "10", label: "10%" },
  { value: "5", label: "5%" },
  { value: "4", label: "4%" },
  { value: "0", label: "0%" },
] as const;

const isBlank = (v?: string | null) => !v || v.trim() === "";
const text = (max: number) =>
  z.string().trim().max(max, `Massimo ${max} caratteri`);

const emailRow = z.object({
  id: z.string().optional(),
  email: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || z.string().email().safeParse(v).success,
      "Indirizzo e-mail non valido",
    ),
  label: z.string(),
});

const phoneRow = z.object({
  id: z.string().optional(),
  phone: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^\+?[\d\s().-]{6,20}$/.test(v),
      "Numero di telefono non valido",
    ),
  label: z.string(),
});

const addressRow = z
  .object({
    id: z.string().optional(),
    type: z.enum(["BILLING", "SHIPPING", "SITE"]),
    street: text(255),
    street_number: text(20),
    extra: text(255),
    postal_code: text(10),
    city: text(100),
    province: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || /^[A-Za-z]{2}$/.test(v),
        "Usa la sigla di 2 lettere (es. NA)",
      ),
    country_code: z.string().length(2),
  })
  .superRefine((a, ctx) => {
    // Una riga completamente vuota viene scartata; se è compilata a metà, segnalo i campi mancanti
    if (isBlank(a.street) && isBlank(a.postal_code) && isBlank(a.city)) return;

    (
      [
        ["street", "Inserisci la via"],
        ["postal_code", "Inserisci il codice postale"],
        ["city", "Inserisci la città"],
      ] as const
    ).forEach(([key, message]) => {
      if (isBlank(a[key]))
        ctx.addIssue({ code: "custom", path: [key], message });
    });
  });

export const clientFormSchema = z
  .object({
    type: z.enum(["PERSON", "COMPANY"]),
    salutation: z.string(),
    name: text(100),
    surname: text(100),
    company_name: text(100),

    emails: z.array(emailRow).max(10, "Massimo 10 indirizzi e-mail"),
    phones: z.array(phoneRow).max(10, "massimo 10 numeri di telefono"),
    website: text(255).refine(
      (v) => v === "" || /^https?:\/\/.+\..+/i.test(v),
      "Inserisci un indirizzo valido, ad esempio https://esempio.it",
    ),
    group_ids: z.array(z.string()),

    note: text(5000),
    addresses: z.array(addressRow).max(10, "Massimo 10 indirizzi"),
    payment_terms: text(100),

    country_code: z.string().length(2),
    default_vat_rate: z.string(),
    vat_number: text(20),
    tax_code: text(20),
    pec: text(255).refine(
      (v) => v === "" || z.string().email().safeParse(v).success,
      "Inserisci un indirizzo PEC valido",
    ),
    sdi_code: text(7),
    is_public_administration: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.type === "PERSON" && isBlank(v.name) && isBlank(v.surname)) {
      ctx.addIssue({
        code: "custom",
        path: ["name"],
        messages: "Inserisci almeno il nome o il cognome",
      });
    }

    if (v.type === "COMPANY" && isBlank(v.company_name)) {
      ctx.addIssue({
        code: "custom",
        path: ["company_name"],
        message: "Inserisci il nome dell' azienda",
      });
    }

    const italy = v.country_code === "IT";

    // controllo P.IVA
    if (v.type === "COMPANY" && isBlank(v.vat_number)) {
      ctx.addIssue({
        code: "custom",
        path: ["vat_number"],
        message: "La partita IVA è obbligatoria per le aziende",
      });
    } else if (
      italy &&
      !isBlank(v.vat_number) &&
      !/^(IT)?\d{11}$/i.test(v.vat_number.replace(/\s/g, ""))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["vat_number"],
        message: "La partita IVA italiana deve avere 11 cifre",
      });
    }

    // CONTROLLO C.FISCALE
    if (
      italy &&
      !isBlank(v.tax_code) &&
      !/^[A-Z0-9]{11,16}$/i.test(v.tax_code.replace(/\s/g, ""))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["tax_code"],
        message: "Il codice fiscale deve avere da 11 a 16 caratteri",
      });
    }

    // se pubblica amministrazione codico univoco obbligatorio
    const sdiLength = v.is_public_administration ? 6 : 7;
    if (v.is_public_administration && isBlank(v.sdi_code)) {
      ctx.addIssue({
        code: "custom",
        path: ["sdi_code"],
        message:
          "Per la pubblica amministrazione il codice univoco ufficio è obbligatorio",
      });
    } else if (
      !isBlank(v.sdi_code) &&
      !new RegExp(`^[A-Za-z0-9]{${sdiLength}}$`).test(v.sdi_code)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["sdi_code"],
        message: `Il codice deve avere ${sdiLength} caratteri`,
      });
    }
  });

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const clientFormDefaults: ClientFormValues = {
  type: "PERSON",
  salutation: "",
  name: "",
  surname: "",
  company_name: "",
  emails: [{ email: "", label: "Lavoro" }],
  phones: [{ phone: "", label: "Lavoro" }],
  website: "",
  group_ids: [],
  note: "",
  addresses: [
    {
      type: "BILLING",
      street: "",
      street_number: "",
      extra: "",
      postal_code: "",
      city: "",
      province: "",
      country_code: "IT",
    },
  ],
  payment_terms: "",
  country_code: "IT",
  default_vat_rate: VAT_RATE_DEFAULT,
  vat_number: "",
  tax_code: "",
  pec: "",
  sdi_code: "",
  is_public_administration: false,
};

/* -------------------------------------------------------------------------- */
/* Form -> payload API                                                         */
/* -------------------------------------------------------------------------- */

const orNull = (v: string) => (isBlank(v) ? null : v.trim());

/** Indici originali delle righe non vuote: servono anche per rimappare gli errori del server. */
export function keptRowIndexes(v: ClientFormValues) {
  const keep = <T>(rows: T[], blank: (row: T) => boolean) =>
    rows.flatMap((row, i) => (blank(row) ? [] : [i]));

  return {
    emails: keep(v.emails, (r) => isBlank(r.email)),
    phones: keep(v.phones, (r) => isBlank(r.phone)),
    addresses: keep(
      v.addresses,
      (a) => isBlank(a.street) && isBlank(a.postal_code) && isBlank(a.city),
    ),
  };
}

export function toClientPayload(v: ClientFormValues) {
  const kept = keptRowIndexes(v);
  const isPerson = v.type === "PERSON";
  const withId = (id?: string) => (id ? { id } : {});
  const defaultsSeen = new Set<string>();

  return {
    type: v.type,
    salutation: isPerson ? orNull(v.salutation) : null,
    name: isPerson ? orNull(v.name) : null,
    surname: isPerson ? orNull(v.surname) : null,
    company_name: isPerson ? null : orNull(v.company_name),

    website: orNull(v.website),
    pec: orNull(v.pec),
    note: orNull(v.note),
    payment_terms: orNull(v.payment_terms),

    country_code: v.country_code,
    tax_code: orNull(v.tax_code),
    vat_number: orNull(v.vat_number),
    sdi_code: orNull(v.sdi_code),
    default_vat_rate:
      v.default_vat_rate === VAT_RATE_DEFAULT
        ? null
        : Number(v.default_vat_rate),
    is_public_administration: v.is_public_administration,

    // Il primo contatto compilato è quello principale
    emails: kept.emails.map((i, n) => ({
      ...withId(v.emails[i].id),
      email: v.emails[i].email,
      label: orNull(v.emails[i].label),
      is_primary: n === 0,
    })),
    phones: kept.phones.map((i, n) => ({
      ...withId(v.phones[i].id),
      phone: v.phones[i].phone,
      label: orNull(v.phones[i].label),
      is_primary: n === 0,
    })),
    // Il primo indirizzo di ogni tipologia è quello predefinito
    addresses: kept.addresses.map((i) => {
      const a = v.addresses[i];
      const isDefault = !defaultsSeen.has(a.type);
      defaultsSeen.add(a.type);

      return {
        ...withId(a.id),
        type: a.type,
        street: a.street,
        street_number: orNull(a.street_number),
        extra: orNull(a.extra),
        postal_code: a.postal_code,
        city: a.city,
        province: orNull(a.province)?.toUpperCase() ?? null,
        country_code: a.country_code,
        is_default: isDefault,
      };
    }),
    group_ids: v.group_ids,
  };
}

export type ClientPayload = ReturnType<typeof toClientPayload>;

/* -------------------------------------------------------------------------- */
/* Risorsa API -> form (modalità update)                                       */
/* -------------------------------------------------------------------------- */

/** Adatta questo tipo all'output reale di ClientResources. */
export type ClientResource = {
  type: "PERSON" | "COMPANY";
  salutation: string | null;
  name: string | null;
  surname: string | null;
  company_name: string | null;
  website: string | null;
  pec: string | null;
  note: string | null;
  payment_terms: string | null;
  country_code: string;
  tax_code: string | null;
  vat_number: string | null;
  sdi_code: string | null;
  default_vat_rate: string | number | null;
  is_public_administration: boolean;
  emails?: { id: string; email: string; label: string | null }[];
  phones?: { id: string; phone: string; label: string | null }[];
  addresses?: {
    id: string;
    type: "BILLING" | "SHIPPING" | "SITE";
    street: string;
    street_number: string | null;
    extra: string | null;
    postal_code: string;
    city: string;
    province: string | null;
    country_code: string;
  }[];
  groups?: { id: string }[];
};

export function toFormValues(c: ClientResource): ClientFormValues {
  const d = clientFormDefaults;

  return {
    type: c.type,
    salutation: c.salutation ?? "",
    name: c.name ?? "",
    surname: c.surname ?? "",
    company_name: c.company_name ?? "",
    emails: c.emails?.length
      ? c.emails.map((e) => ({
          id: e.id,
          email: e.email,
          label: e.label ?? "Lavoro",
        }))
      : d.emails,
    phones: c.phones?.length
      ? c.phones.map((p) => ({
          id: p.id,
          phone: p.phone,
          label: p.label ?? "Lavoro",
        }))
      : d.phones,
    website: c.website ?? "",
    group_ids: c.groups?.map((g) => g.id) ?? [],
    note: c.note ?? "",
    addresses: c.addresses?.length
      ? c.addresses.map((a) => ({
          id: a.id,
          type: a.type,
          street: a.street,
          street_number: a.street_number ?? "",
          extra: a.extra ?? "",
          postal_code: a.postal_code,
          city: a.city,
          province: a.province ?? "",
          country_code: a.country_code,
        }))
      : d.addresses,
    payment_terms: c.payment_terms ?? "",
    country_code: c.country_code,
    default_vat_rate:
      c.default_vat_rate == null
        ? VAT_RATE_DEFAULT
        : String(Number(c.default_vat_rate)),
    vat_number: c.vat_number ?? "",
    tax_code: c.tax_code ?? "",
    pec: c.pec ?? "",
    sdi_code: c.sdi_code ?? "",
    is_public_administration: c.is_public_administration,
  };
}
