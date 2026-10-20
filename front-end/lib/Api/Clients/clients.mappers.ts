import type { ClientDetail } from "@/types/client";
import type { ClientFormValues } from "./clients.schema";

export function toFormValues(c: ClientDetail & { group_ids?: string[] }): Partial<ClientFormValues> {
  return {
    type: c.type,
    salutation: c.salutation ?? undefined,
    name: c.name ?? "",
    surname: c.surname ?? "",
    company_name: c.company_name ?? "",
    pec: c.pec ?? "",
    website: c.website ?? "",
    note: c.note ?? "",
    payment_terms: c.payment_terms ?? "",
    country_code: c.country_code,
    tax_code: c.tax_code ?? "",
    vat_number: c.vat_number ?? "",
    sdi_code: c.sdi_code ?? "",
    default_vat_rate: c.default_vat_rate ?? undefined,
    is_public_administration: c.is_public_administration,
    emails: c.emails.map(({ id, email, label, is_primary }) => ({ id, email, label: label ?? "", is_primary })),
    phones: c.phones.map(({ id, phone, label, is_primary }) => ({ id, phone, label: label ?? "", is_primary })),
    addresses: (c.addresses ?? []).map(({ id, type, street, street_number, extra, postal_code, city, province, country_code, is_default }) => ({
      id, type, street,
      street_number: street_number ?? "",
      extra: extra ?? "",
      postal_code, city,
      province: province ?? "",
      country_code, is_default,
    })),
    group_ids: c.group_ids ?? [],
  };
}