import type { QuoteAppearanceValues } from "@/types/quote";
import type { QuoteContact } from "./quote.types";

// ============================================================================
// RICERCA
// ============================================================================

export const MIN_CHARS = 2;
export const DEBOUNCE_MS = 300;

// ============================================================================
// MESSAGGI
// ============================================================================

export const PRODUCT_ERROR = "Errore durante il caricamento dei prodotti";
export const CLIENT_ERROR = "Errore durante la ricerca dei clienti";
export const SETTINGS_ERROR =
  "Errore durante il caricamento delle impostazioni";
export const SUBMIT_ERROR = "Errore durante il salvataggio";
export const SUBMIT_BUSY = "Salvataggio già in corso";

export const VALIDATION_ERRORS = {
  clientRequired: "Seleziona un cliente",
  itemsRequired: "Aggiungi almeno una voce al preventivo",
  titleRequired: "Inserisci titolo preventivo",
  discountInvalid: "Sconto del preventivo non valido",
  discountPercentageMax: "Lo sconto percentuale non può superare 100",
  vatInvalid: "Aliquota IVA non valida",
  surchargeInvalid: "Maggiorazione non valida",
} as const;

// ============================================================================
// VALUTA E FORMATO
// ============================================================================

export const DEFAULT_CURRENCY = "EUR";
export const MONEY_LOCALE = "it-IT";

// ============================================================================
// VALORI VUOTI / DI FALLBACK
// ============================================================================

export const EMPTY_CONTACT: QuoteContact = {
  email: "",
  phone: "",
  address: "",
};

export const EMPTY_APPEARANCE: QuoteAppearanceValues = {
  template: "classic",
  primaryColor: "#1F2937",
  accentColor: "#2563EB",
};
