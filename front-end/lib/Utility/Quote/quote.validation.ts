import { parseNumber } from "@/lib/utils";
import type { QuoteItem } from "@/types/quote";
import { VALIDATION_ERRORS } from "./quote.consts";
import type {
  ParsedQuoteValues,
  QuoteHeaderValues,
  TaxQuoteValue,
  ValidationResult,
} from "./quote.types";

type ValidateInput = {
  // In modifica, se il cliente completo non è stato caricato, vale quello salvato
  clientId: ParsedQuoteValues["clientId"] | null | undefined;
  items: QuoteItem[];
  header: QuoteHeaderValues;
  tax: TaxQuoteValue;
};

const fail = (error: string): ValidationResult => ({ ok: false, error });

export function validateQuoteForm({
  clientId,
  items,
  header,
  tax,
}: ValidateInput): ValidationResult {
  if (!clientId) return fail(VALIDATION_ERRORS.clientRequired);

  if (items.length === 0) return fail(VALIDATION_ERRORS.itemsRequired);

  if (!header.title.trim()) return fail(VALIDATION_ERRORS.titleRequired);

  const discountValue = parseNumber(tax.discount_value || "0");
  if (Number.isNaN(discountValue) || discountValue < 0) {
    return fail(VALIDATION_ERRORS.discountInvalid);
  }
  if (tax.discount_type === "percentage" && discountValue > 100) {
    return fail(VALIDATION_ERRORS.discountPercentageMax);
  }

  const vatRate = parseNumber(tax.vat_rate);
  if (Number.isNaN(vatRate) || vatRate < 0 || vatRate > 100) {
    return fail(VALIDATION_ERRORS.vatInvalid);
  }

  const surcharge = parseNumber(tax.surcharge || "0");
  if (Number.isNaN(surcharge) || surcharge < 0) {
    return fail(VALIDATION_ERRORS.surchargeInvalid);
  }

  return { ok: true, values: { clientId, vatRate, surcharge, discountValue } };
}
