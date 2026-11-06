import { isAxiosError } from "axios";
import type { QuoteSettingsData, QuoteTemplate } from "./quote-settings.types";
import {
  FALLBACK_CURRENCY,
  FALLBACK_LOCALE,
  FALLBACK_TEMPLATE,
  HEX_COLOR_REGEX,
  QUOTE_TEMPLATE_IDS,
  SETTINGS_MESSAGES,
} from "./quote-settings.consts";

/** Restringe una stringa libera a un template valido, senza cast. */
export function toQuoteTemplate(value: string | null | undefined): QuoteTemplate {
  return QUOTE_TEMPLATE_IDS.find((t) => t === value) ?? FALLBACK_TEMPLATE;
}

/** Durante la digitazione un colore può essere incompleto ("#1F2"): si usa il fallback. */
export function safeColor(value: string | null | undefined, fallback: string): string {
  return value && HEX_COLOR_REGEX.test(value) ? value : fallback;
}

/**
 * Intl.NumberFormat lancia RangeError con locale o valuta non validi
 * (es. mentre l'utente scrive "EU"): senza try/catch crasherebbe la pagina.
 */
export function createMoneyFormatter(
  locale?: string | null,
  currency?: string | null,
): Intl.NumberFormat {
  try {
    return new Intl.NumberFormat((locale || FALLBACK_LOCALE).replace("_", "-"), {
      style: "currency",
      currency: currency || FALLBACK_CURRENCY,
    });
  } catch {
    return new Intl.NumberFormat(FALLBACK_LOCALE, {
      style: "currency",
      currency: FALLBACK_CURRENCY,
    });
  }
}

/** Primo messaggio di validazione (422) di Laravel, altrimenti uno generico. */
export function getSaveErrorMessage(err: unknown): string {
  if (isAxiosError(err) && err.response?.status === 422) {
    const first = Object.values(err.response.data.errors ?? {})[0] as
      | string[]
      | undefined;
    return first?.[0] ?? SETTINGS_MESSAGES.invalidData;
  }
  return SETTINGS_MESSAGES.saveFailed;
}

export function validateSettings(v: QuoteSettingsData): string | null {
  if (
    !HEX_COLOR_REGEX.test(v.quote_primary_color) ||
    !HEX_COLOR_REGEX.test(v.quote_accent_color)
  )
    return "I colori devono essere in formato esadecimale (es. #1F2937).";
  if (!v.quote_prefix.trim())
    return "Il prefisso dei preventivi è obbligatorio.";
  if (v.quote_start_number < 1)
    return "Il numero iniziale deve essere almeno 1.";
  if (v.next_quote_number < 1)
    return "Il prossimo numero deve essere almeno 1.";
  if (v.quote_number_padding < 1 || v.quote_number_padding > 10)
    return "Le cifre del numero devono essere tra 1 e 10.";
  if (v.default_vat_rate < 0 || v.default_vat_rate > 100)
    return "L'aliquota IVA deve essere tra 0 e 100.";
  if (v.default_validity_days < 1)
    return "La validità deve essere di almeno 1 giorno.";
  return null;
}