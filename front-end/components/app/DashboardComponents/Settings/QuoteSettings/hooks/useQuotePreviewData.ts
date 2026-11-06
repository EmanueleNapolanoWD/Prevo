"use client";

import { useMemo, type ComponentProps } from "react";
import type { QuoteAppearanceValues } from "@/types/quote";
import type { QuoteSettingsDataWithCompany } from "@/lib/Utility/QuoteSettings/quote-settings.types";
import type { QuoteCompany } from "@/types/quote";
import {
  FALLBACK_ACCENT_COLOR,
  FALLBACK_PRIMARY_COLOR,
} from "@/lib/Utility/QuoteSettings/quote-settings.consts";
import {
  createMoneyFormatter,
  safeColor,
  toQuoteTemplate,
} from "@/lib/Utility/QuoteSettings/quote-settings.helper";
import {
  PREVIEW_CLIENT,
  PREVIEW_COMPANY,
  PREVIEW_CONTACT,
  PREVIEW_HEADER_TEXT,
  PREVIEW_ITEMS,
} from "@/lib/Utility/QuoteSettings/quote-settings.preview";
import {
  calcTotals,
  dateInDays,
  formatQuoteNumber,
  parseNumber,
} from "@/lib/utils";
import type {
  QuoteHeaderValues,
  TaxQuoteValue,
} from "../../../Quotes/hooks/useQuoteForm";
import type { QuoteDocument } from "../../../Quotes/QuoteReview/QuoteDocument/QuoteDocument";

type QuoteDocumentProps = ComponentProps<typeof QuoteDocument>;

export function useQuotePreviewData(
  values: QuoteSettingsDataWithCompany,
): QuoteDocumentProps {
  const {
    default_quote_template,
    quote_primary_color,
    quote_accent_color,
    default_vat_rate,
    default_validity_days,
    default_notes,
    default_terms,
    default_currency,
    locale,
  } = values;

  const money = useMemo(
    () => createMoneyFormatter(locale, default_currency),
    [locale, default_currency],
  );

  const appearance = useMemo<QuoteAppearanceValues>(
    () => ({
      template: toQuoteTemplate(default_quote_template),
      primaryColor: safeColor(quote_primary_color, FALLBACK_PRIMARY_COLOR),
      accentColor: safeColor(quote_accent_color, FALLBACK_ACCENT_COLOR),
    }),
    [default_quote_template, quote_primary_color, quote_accent_color],
  );

  // formatQuoteNumber legge più campi delle impostazioni: si dipende da values
  const number = useMemo(() => formatQuoteNumber(values), [values]);

  const header = useMemo<QuoteHeaderValues>(
    () => ({ number, ...PREVIEW_HEADER_TEXT }),
    [number],
  );

  const tax = useMemo<TaxQuoteValue>(
    () => ({
      vat_rate: String(
        Number.isFinite(default_vat_rate) ? default_vat_rate : 0,
      ),
      valid_until: dateInDays(default_validity_days ?? 0),
      surcharge: "0",
      discount_type: "percentage",
      discount_value: "0",
      notes: default_notes ?? "",
      terms: default_terms ?? "",
    }),
    [default_vat_rate, default_validity_days, default_notes, default_terms],
  );

  const totals = useMemo(
    () =>
      calcTotals(
        PREVIEW_ITEMS,
        parseNumber(tax.surcharge),
        parseNumber(tax.vat_rate),
        { type: tax.discount_type, value: parseNumber(tax.discount_value) },
      ),
    [tax.surcharge, tax.vat_rate, tax.discount_type, tax.discount_value],
  );

  return {
    settings: values,
    company: (values.company
      ? {
          ...PREVIEW_COMPANY, // Fornisce i campi di fallback se mancano
          ...values.company, // Sovrascrive con i dati reali dell'azienda corrente
        }
      : PREVIEW_COMPANY) as QuoteCompany,
    header,
    tax,
    appearance,
    contact: PREVIEW_CONTACT,
    selectedClient: PREVIEW_CLIENT,
    items: PREVIEW_ITEMS,
    totals,
    money,
  };
}
