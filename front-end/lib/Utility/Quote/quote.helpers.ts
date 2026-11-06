import {
  centsToEuros,
  dateInDays,
  eurosToCents,
  formatQuoteNumber,
} from "@/lib/utils";
import {
  API_TO_DISCOUNT_TYPE,
  DISCOUNT_TYPE_TO_API,
  type DiscountType,
  type QuoteAppearanceValues,
  type QuoteDetail,
  type QuoteItem,
  type QuotePayload,
} from "./quote.types";
import type { ClientDetail } from "@/types/client";
import type { QuoteSettingsData } from "@/lib/Utility/QuoteSettings/quote-settings.types";
import type {
  ClientAddress,
  ContactId,
  ParsedQuoteValues,
  QuoteContact,
  QuoteHeaderValues,
  QuoteInitialValues,
  TaxQuoteValue,
  QuotePayloadItem,
  QuoteLine,
  Quote,
  QuoteTemplateKey,
} from "./quote.types";
import { EMPTY_APPEARANCE } from "./quote.consts";

// ============================================================================
// HELPER: unità monetarie
// Form e anteprima (calcTotals) lavorano in EURO; l'API parla in CENTESIMI.
// Lo sconto percentuale non è un importo e resta una percentuale.
// ============================================================================

export function discountToApi(type: DiscountType, value: number): number {
  return type === "percentage" ? value : eurosToCents(value);
}

export function discountFromApi(type: DiscountType, value: unknown): number {
  return type === "percentage"
    ? Number(value ?? 0)
    : centsToEuros(value as number);
}

// ============================================================================
// HELPER: contatti cliente
// ============================================================================

// Preferisce il contatto primario, altrimenti il primo della lista
export function pickDefault<T extends { id?: ContactId; is_primary?: boolean }>(
  items: T[] | undefined | null,
): T | undefined {
  if (!items || items.length === 0) return undefined;
  return items.find((item) => item.is_primary) ?? items[0];
}

export function formatAddress(address: ClientAddress | null): string {
  if (!address) return "";
  const cityLine = [address.postal_code, address.city]
    .filter(Boolean)
    .join(" ");
  return [address.street, cityLine].filter(Boolean).join(", ");
}

// Rimuove la modifica manuale di un singolo campo del contatto
export function withoutContactField(
  edits: Partial<QuoteContact>,
  key: keyof QuoteContact,
): Partial<QuoteContact> {
  const next = { ...edits };
  delete next[key];
  return next;
}

// ============================================================================
// HELPER: mapper preventivo (backend) -> valori del form (solo modifica)
// Tutti i campi vanno valorizzati, anche se vuoti: i valori del preventivo
// vincono sui default delle impostazioni azienda (note, termini, IVA, validità).
// ============================================================================

export function quoteToHeader(q: QuoteDetail): QuoteHeaderValues {
  return {
    number: q.number ?? "",
    title: q.title ?? "",
    description: q.description ?? "",
  };
}

export function quoteToTax(q: QuoteDetail): TaxQuoteValue {
  const discountType: DiscountType = q.discount_type
    ? API_TO_DISCOUNT_TYPE[q.discount_type]
    : "percentage";

  return {
    vat_rate: String(Number(q.vat_rate ?? 0)),
    valid_until: q.valid_until?.slice(0, 10) ?? "", // input date: YYYY-MM-DD
    surcharge: String(centsToEuros(q.surcharge)),
    discount_type: discountType,
    discount_value: String(discountFromApi(discountType, q.discount_value)),
    notes: q.notes ?? "",
    terms: q.terms ?? "",
  };
}

export function quoteToContact(q: QuoteDetail): QuoteContact {
  return {
    email: q.contact?.email ?? "",
    phone: q.contact?.phone ?? "",
    address: q.contact?.address ?? "",
  };
}

// ============================================================================
// HELPER: valori iniziali e chiave della sorgente
// ============================================================================

// In modifica parte dal preventivo, in creazione dai valori vuoti
export function buildInitialValues(
  quote: QuoteDetail | undefined,
  client: ClientDetail | null,
): QuoteInitialValues {
  return {
    header: quote ? quoteToHeader(quote) : {},
    tax: quote ? quoteToTax(quote) : {},
    appearance: quote ? toQuoteAppearanceValues(quote.appearance) : {},
    contact: quote ? quoteToContact(quote) : {},
    items: quote ? quote.items.map(toQuoteItem) : [],
    client,
  };
}

// Chiave della 'sorgente' del form: quando cambia avvia nuova versione dopo un refresh
export function getSourceKey(
  quote: QuoteDetail | undefined,
  initialClient: ClientDetail | null,
): string {
  return `${quote?.id ?? "new"}:${quote?.version ?? 0}:${initialClient?.id ?? "none"}`;
}

// ============================================================================
// HELPER: default dalle impostazioni azienda
// ============================================================================

export function getHeaderDefaults(
  settings: QuoteSettingsData | null,
): QuoteHeaderValues {
  return {
    number: settings ? formatQuoteNumber(settings) : "",
    title: "",
    description: "",
  };
}

export function getTaxDefaults(
  settings: QuoteSettingsData | null,
): TaxQuoteValue {
  return {
    vat_rate: settings ? String(Number(settings.default_vat_rate ?? 0)) : "",
    valid_until: settings
      ? dateInDays(settings.default_validity_days ?? 0)
      : "",
    surcharge: "0",
    discount_type: "percentage",
    discount_value: "0",
    notes: settings?.default_notes ?? "",
    terms: settings?.default_terms ?? "",
  };
}

// ============================================================================
// HELPER: payload per l'API (importi in centesimi)
// items: toQuotePayloadItem deve convertire unit_price e lo sconto Fixed di
// riga in centesimi.
// ============================================================================

type BuildPayloadInput = {
  values: ParsedQuoteValues;
  contact: QuoteContact;
  header: QuoteHeaderValues;
  tax: TaxQuoteValue;
  appearance: QuoteAppearanceValues;
  items: QuoteItem[];
};

export function buildQuotePayload({
  values,
  contact,
  header,
  tax,
  appearance,
  items,
}: BuildPayloadInput): QuotePayload {
  const { clientId, vatRate, surcharge, discountValue } = values;

  return {
    client_id: clientId,
    contact: {
      email: contact.email || null,
      phone: contact.phone || null,
      address: contact.address || null,
    },
    title: header.title.trim(),
    description: header.description.trim() || null,
    vat_rate: vatRate,
    surcharge: eurosToCents(surcharge),
    // Senza sconto non si invia nulla: il backend azzera tipo e valore
    ...(discountValue > 0
      ? {
          discount_type: DISCOUNT_TYPE_TO_API[tax.discount_type],
          discount_value: discountToApi(tax.discount_type, discountValue),
        }
      : {}),
    valid_until: tax.valid_until || null,
    notes: tax.notes.trim() || null,
    terms: tax.terms.trim() || null,
    appearance: toQuotePayloadAppearance(appearance),
    items: items.map(toQuotePayloadItem),
  };
}

/** Converte la riga del form nella riga del payload. */
export function toQuotePayloadItem(item: QuoteItem): QuotePayloadItem {
  return {
    product_id: item.product_id,
    // quote_items ha solo `description`: nome e descrizione vengono uniti.
    description: item.description
      ? `${item.name}\n${item.description}`
      : item.name,
    unit: item.unit,
    quantity: item.quantity,
    unit_price: item.unit_price,
    ...(item.discount_value > 0
      ? {
          discount_type: DISCOUNT_TYPE_TO_API[item.discount_type],
          discount_value: item.discount_value,
        }
      : {}),
  };
}

/** Converte i colori del form (camelCase) nel formato dell'API. */
export function toQuotePayloadAppearance(
  a: QuoteAppearanceValues,
): NonNullable<QuotePayload["appearance"]> {
  return {
    template: a.template,
    primary_color: a.primaryColor,
    accent_color: a.accentColor,
  };
}

// ============================================================================
// Mapping API -> UI (per la modifica)
// ============================================================================

/**
 * Inverso di toQuotePayloadItem: la prima riga di `description` è il nome,
 * il resto è la descrizione. Number() perché Laravel può restituire i
 * decimali come stringhe.
 */
export function toQuoteItem(line: QuoteLine): QuoteItem {
  const [name, ...rest] = line.description.split("\n");
  return {
    id: String(line.id),
    product_id: line.product_id,
    name,
    description: rest.join("\n"),
    quantity: Number(line.quantity),
    unit: line.unit,
    unit_price: Number(line.unit_price),
    discount_type: line.discount_type
      ? API_TO_DISCOUNT_TYPE[line.discount_type]
      : "percentage",
    discount_value: Number(line.discount_value ?? 0),
  };
}

/** Inverso di toQuotePayloadAppearance. */
export function toQuoteAppearanceValues(
  a: Quote["appearance"] | null | undefined,
): Partial<QuoteAppearanceValues> {
  return {
    ...(a?.template && { template: a.template }),
    ...(a?.primary_color && { primaryColor: a.primary_color }),
    ...(a?.accent_color && { accentColor: a.accent_color }),
  };
}

export function getAppearanceDefaults(
  settings: QuoteSettingsData | null,
): QuoteAppearanceValues {
  return {
    template:
      (settings?.default_quote_template as QuoteAppearanceValues | undefined) ??
      EMPTY_APPEARANCE.template,
    primaryColor:
      settings?.quote_primary_color ?? EMPTY_APPEARANCE.primaryColor,
    accentColor:
      settings?.quote_accent_color ?? EMPTY_APPEARANCE.accentColor,
  };
}
