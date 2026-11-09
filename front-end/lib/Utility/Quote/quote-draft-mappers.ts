import type {
  QuoteDraft,
  QuoteHeaderValues,
  TaxQuoteValue,
  QuoteItem,
} from "@/lib/Utility/Quote/quote.types";
import type { ClientDetail } from "@/lib/Utility/Clients/clients.types";
import type { QuoteSettingsData } from "@/lib/Utility/QuoteSettings/quote-settings.types";
import { dateInDays } from "@/lib/utils";

// ============================================================================
// MAPPING: QuoteDraft (bozza AI) -> valori del form (useQuoteForm)
// ============================================================================

export interface MapDraftToFormValuesContext {
  /** Impostazioni azienda: fornisce default_vat_rate. */
  settings: QuoteSettingsData | null;
}

export interface MapDraftToFormValuesResult {
  header: QuoteHeaderValues;
  tax: TaxQuoteValue;
  items: QuoteItem[];

  clientId: string | null;
  clientName: string | null;
  client: ClientDetail | null;

  /** Messaggio di avviso se il cliente non è stato trovato o è ambiguo. */
  clientWarning: string | null;
}

/**
 * Trasforma una QuoteDraft (restituita da generateQuoteDraftAction) nei
 * valori dei setter del form di QuoteForm.
 *
 * La funzione è pura: non chiama setter o API.
 */
export function mapDraftToFormValues(
  draft: QuoteDraft,
  context: MapDraftToFormValuesContext,
): MapDraftToFormValuesResult {
  const { settings } = context;


  // --- Header -----------------------------------------------------
  const header: QuoteHeaderValues = {
    number: draft.number,
    title: draft.title,
    description: draft.description,
  };

  // --- Tax --------------------------------------------------------
  const defaultVatRate = settings?.default_vat_rate ?? 0;
  const firstItemVatRate = draft.items[0]?.vat_rate ?? defaultVatRate;

  const tax: TaxQuoteValue = {
    vat_rate: String(firstItemVatRate),
    valid_until: dateInDays(draft.valid_days),
    surcharge: "0",
    discount_type: "percentage",
    discount_value: "0",
    notes: draft.notes ?? "",
    terms: "",
  };

  // --- Items ------------------------------------------------------
  const items: QuoteItem[] = draft.items.map((item, index) => ({
    id: crypto.randomUUID(),
    product_id: item.product_id,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    unit: "pz",
    unit_price: item.unit_price_cents / 100,
    discount_type: "percentage",
    discount_value: 0,
    sort_order: index + 1,
  }));

  // --- Cliente ----------------------------------------------------
  // Il cliente viene già recuperato dal backend.
  // Verifichiamo che il suo ID corrisponda a client_id.
  const client: ClientDetail | null =
    draft.client?.id === draft.client_id ? draft.client : null;

  const clientId = client?.id ?? null;
  const clientName = draft.client_name ?? null;

  let clientWarning: string | null = null;

  if (!client && clientName) {
    clientWarning = `Cliente «${clientName}» non trovato in anagrafica oppure corrispondenza ambigua: selezionalo o crealo manualmente.`;
  }

  return {
    header,
    tax,
    items,
    clientId,
    clientName,
    client,
    clientWarning,
  };
}