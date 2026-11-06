import type {
  Company,
  CompanyValues,
  ContactItem,
  AddressItem,
} from "./companies.type";

/**
 * Garantisce esattamente un predefinito:
 * - se non ce n'è nessuno, lo diventa il primo;
 * - se ce n'è più di uno, resta solo il primo;
 * - il predefinito viene messo in cima alla lista.
 */
function normalizePrimary<T extends { is_primary: boolean }>(items: T[]): T[] {
  if (items.length === 0) return items;

  const primaryIdx = Math.max(
    items.findIndex((i) => i.is_primary),
    0,
  );

  const normalized = items.map((i, idx) => ({
    ...i,
    is_primary: idx === primaryIdx,
  }));

  const [primary] = normalized.splice(primaryIdx, 1);
  return [primary, ...normalized];
}

export function companyToValues(company: Company): CompanyValues {
  const {
    name,
    legal_name,
    legal_form,
    country_code,
    vat_number,
    tax_code,
    tax_regime,
    sdi_code,
    pec,
    rea_office,
    rea_number,
    share_capital,
    ateco_code,
    iban,
    website,
  } = company;

  const emails: ContactItem[] = (company.emails ?? []).map((e) => ({
    id: e.id,
    value: e.email,
    is_primary: e.is_primary,
  }));

  const phones: ContactItem[] = (company.phones ?? []).map((p) => ({
    id: p.id,
    value: p.phone,
    is_primary: p.is_primary,
  }));

  const addresses: AddressItem[] = (company.addresses ?? []).map((a) => ({
    id: a.id,
    type: a.type,
    label: a.label,
    address: a.address,
    address_extra: a.address_extra,
    postal_code: a.postal_code,
    city: a.city,
    province: a.province,
    country_code: a.country_code,
    is_primary: a.is_primary,
  }));

  return {
    name,
    legal_name,
    legal_form,
    country_code,
    vat_number,
    tax_code,
    tax_regime,
    sdi_code,
    pec,
    rea_office,
    rea_number,
    share_capital,
    ateco_code,
    iban,
    website,
    logo_url: company.logo_url ?? null,
    emails: normalizePrimary(emails),
    phones: normalizePrimary(phones),
    addresses: normalizePrimary(addresses),
  };
}
