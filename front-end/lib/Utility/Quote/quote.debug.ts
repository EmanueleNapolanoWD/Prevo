// Debug del form preventivo.
// Attivo solo con NEXT_PUBLIC_DEBUG_QUOTE=1 in .env.local (e mai in produzione):
// negli altri casi ogni funzione esce subito e non costa nulla.

import { parseNumber } from "@/lib/utils";
import {
  API_TO_DISCOUNT_TYPE,
  DISCOUNT_TYPE_TO_API,
  type QuoteDetail,
  type QuoteInitialValues,
  type QuoteItem,
  type QuoteTotals,
  type TaxQuoteValue,
} from "./quote.types";

const ENABLED =
  process.env.NEXT_PUBLIC_DEBUG_QUOTE === "1" &&
  process.env.NODE_ENV !== "production";

// Valori che le due mappe di conversione conoscono davvero
const UI_TYPES = Object.keys(DISCOUNT_TYPE_TO_API);
const API_TYPES = Object.keys(API_TO_DISCOUNT_TYPE);

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

// ============================================================================
// 1. SORGENTE (solo in modifica): cosa manda il backend e cosa ne esce
// ============================================================================

export function debugQuoteSource(
  quote: QuoteDetail | undefined,
  initial: QuoteInitialValues,
) {
  if (!ENABLED || !quote) return;

  console.groupCollapsed(`[quote] sorgente — ${quote.number ?? quote.id}`);
  try {
    console.log("valori riconosciuti dalle mappe", {
      api: API_TYPES,
      ui: UI_TYPES,
    });

    // Una riga per voce: a sinistra il dato grezzo del backend, a destra quello del form
    console.table(
      quote.items.map((raw, i) => {
        const mapped = initial.items[i];
        return {
          voce: mapped?.name ?? raw.description.split("\n")[0],
          raw_tipo_sconto: raw.discount_type,
          raw_tipo_js: typeof raw.discount_type,
          raw_valore_sconto: raw.discount_value,
          ui_tipo_sconto: mapped?.discount_type,
          ui_valore_sconto: mapped?.discount_value,
          raw_prezzo: raw.unit_price,
          ui_prezzo: mapped?.unit_price,
          tipo_riconosciuto: UI_TYPES.includes(String(mapped?.discount_type)),
        };
      }),
    );

    console.log("sconto globale", {
      raw: { type: quote.discount_type, value: quote.discount_value },
      ui: {
        type: initial.tax.discount_type,
        value: initial.tax.discount_value,
      },
    });
  } finally {
    console.groupEnd();
  }
}

// ============================================================================
// 2. TOTALI: input, righe, output, anomalie e variazioni
// ============================================================================

let previousItems = new Map<string, { type: unknown; value: unknown }>();

function logItemChanges(items: QuoteItem[]) {
  for (const item of items) {
    const before = previousItems.get(item.id);
    if (
      before &&
      (before.type !== item.discount_type || before.value !== item.discount_value)
    ) {
      console.log(`[quote] sconto cambiato: ${item.name}`, {
        prima: before,
        dopo: { type: item.discount_type, value: item.discount_value },
      });
    }
  }

  previousItems = new Map(
    items.map((i) => [i.id, { type: i.discount_type, value: i.discount_value }]),
  );
}

export function debugQuoteTotals({
  items,
  tax,
  totals,
}: {
  items: QuoteItem[];
  tax: TaxQuoteValue;
  totals: QuoteTotals | null;
}) {
  if (!ENABLED) return;

  const warnings: string[] = [];

  console.groupCollapsed(`[quote] totali — ${items.length} voci`);
  try {
    // ---- input del calcolo: valore grezzo → valore dopo parseNumber ----
    const parsed = {
      surcharge: parseNumber(tax.surcharge),
      vat_rate: parseNumber(tax.vat_rate),
      discount_value: parseNumber(tax.discount_value),
    };
    console.log("tax", {
      surcharge: [tax.surcharge, parsed.surcharge],
      vat_rate: [tax.vat_rate, parsed.vat_rate],
      discount_type: tax.discount_type,
      discount_value: [tax.discount_value, parsed.discount_value],
    });

    for (const [key, value] of Object.entries(parsed)) {
      if (!isNumber(value)) warnings.push(`tax.${key} non è un numero: ${value}`);
    }
    if (!UI_TYPES.includes(String(tax.discount_type))) {
      warnings.push(`tax.discount_type non valido: ${String(tax.discount_type)}`);
    }

    // ---- righe (lordo / sconto / netto sono una stima indipendente) ----
    console.table(
      items.map((item, index) => {
        const label = `voce ${index + 1} (${item.name})`;
        const gross = item.quantity * item.unit_price;
        const isPercentage = item.discount_type === "percentage";
        const discount = isPercentage
          ? (gross * item.discount_value) / 100
          : item.discount_value;

        if (!UI_TYPES.includes(String(item.discount_type))) {
          warnings.push(
            `${label}: tipo sconto non valido → ${String(item.discount_type)} ` +
              `(ammessi: ${UI_TYPES.join(", ")}). Viene trattato come importo in euro.`,
          );
        }
        if (
          ![item.quantity, item.unit_price, item.discount_value].every(isNumber)
        ) {
          warnings.push(
            `${label}: quantità, prezzo o sconto non sono numeri ` +
              `(${typeof item.quantity}, ${typeof item.unit_price}, ${typeof item.discount_value})`,
          );
        }
        if (isPercentage && item.discount_value > 100) {
          warnings.push(`${label}: sconto percentuale oltre il 100% (${item.discount_value})`);
        }
        if (!isPercentage && item.discount_value > gross) {
          warnings.push(
            `${label}: sconto di ${item.discount_value} € maggiore del lordo (${gross} €)`,
          );
        }

        return {
          voce: item.name,
          qta: item.quantity,
          prezzo: item.unit_price,
          tipo_sconto: item.discount_type,
          valore_sconto: item.discount_value,
          lordo: gross,
          sconto_stimato: discount,
          netto_stimato: gross - discount,
        };
      }),
    );

    // ---- output di calcTotals ----
    console.log("totals", totals);
    if (totals) {
      for (const [key, value] of Object.entries(totals)) {
        if (typeof value === "number" && !Number.isFinite(value)) {
          warnings.push(`totals.${key} non è finito: ${value}`);
        }
      }
    }

    logItemChanges(items);

    if (warnings.length > 0) {
      warnings.forEach((w) => console.warn(`[quote] ${w}`));
    } else {
      console.log("nessuna anomalia rilevata");
    }
  } finally {
    console.groupEnd();
  }
}