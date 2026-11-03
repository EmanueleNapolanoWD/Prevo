/**
 * Unica fonte di verità per etichette, colori e varianti degli stati dei preventivi.
 * Usata da: QuoteList, QuoteRow, RecentQuotes, Dashboard e qualsiasi altro componente
 * che debba rendere lo stato di un preventivo.
 */
import type { QuoteStatus } from "@/types/quote";

export type QuoteStatusConfig = {
  label: string;
  variant: "outline" | "default" | "secondary" | "destructive" | "ghost";
  dotColor: string; // variabile CSS --ds-*
};

export const QUOTE_STATUS: Record<QuoteStatus, QuoteStatusConfig> = {
  DRAFT: {
    label: "Bozza",
    variant: "outline",
    dotColor: "var(--ds-muted-foreground)",
  },
  SENT: {
    label: "Inviato",
    variant: "outline",
    dotColor: "var(--ds-primary)",
  },
  VIEWED: {
    label: "Visualizzato",
    variant: "outline",
    dotColor: "var(--ds-primary)",
  },
  ACCEPTED: {
    label: "Accettato",
    variant: "outline",
    dotColor: "var(--ds-accent-foreground)",
  },
  REJECTED: {
    label: "Rifiutato",
    variant: "outline",
    dotColor: "var(--ds-destructive)",
  },
  EXPIRED: {
    label: "Scaduto",
    variant: "outline",
    dotColor: "var(--ds-muted-foreground)",
  },
};

export const getQuoteStatus = (status: QuoteStatus): QuoteStatusConfig =>
  QUOTE_STATUS[status] ?? QUOTE_STATUS.DRAFT;

/**
 * Stati prodotto (Attivo / Inattivo) per coerenza visiva.
 */
export const PRODUCT_STATUS: Record<string, QuoteStatusConfig> = {
  active: {
    label: "Attivo",
    variant: "outline",
    dotColor: "var(--ds-accent-foreground)",
  },
  inactive: {
    label: "Inattivo",
    variant: "outline",
    dotColor: "var(--ds-muted-foreground)",
  },
};

export const getProductStatus = (isActive: boolean): QuoteStatusConfig =>
  PRODUCT_STATUS[isActive ? "active" : "inactive"];