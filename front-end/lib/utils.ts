import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { QuoteItem, DiscountType } from "@/types/quote";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// UTILS PER CLIENTS
export function buildListHref(
  slug: string,
  filters: { q?: string; tipo?: string },
  page?: number,
) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.tipo) params.set("tipo", filters.tipo);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/${slug}/clients${query ? `?${query}` : ""}`;
}

// UTILS per QUOTE

// Accetta anche la virgola decimale ("12,50"). Stringa vuota => NaN
export function parseNumber(value: string): number {
  const v = value.trim().replace(",", ".");
  return v === "" ? NaN : Number(v);
}

export function calcLineDiscount(item: QuoteItem): number {
  const gross = item.quantity * item.unit_price;
  const raw =
    item.discount_type === "percentage"
      ? (gross * item.discount_value) / 100
      : item.discount_value;
  return Math.min(Math.max(raw, 0), gross);
}

export function calcLineTotal(item: QuoteItem): number {
  return item.quantity * item.unit_price - calcLineDiscount(item);
}

// Data tra N giorni nel formato "YYYY-MM-DD" per <input type="date">
export function dateInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export interface QuoteTotals {
  subtotal: number;
  surcharge: number;
  taxable: number;
  vat: number;
  total: number;
}

const safe = (n: number) => (Number.isFinite(n) ? n : 0);
const round2 = (n: number) => Math.round(n * 100) / 100;

// Maggiorazione e IVA sono percentuali; valori non numerici contano come 0
export function calcTotals(
  items: QuoteItem[],
  surcharge: number,
  vatRate: number,
  discount: { type: DiscountType; value: number } = {
    type: "percentage",
    value: 0,
  },
) {
  const subtotal = items.reduce((sum, i) => sum + calcLineTotal(i), 0);

  const rawDiscount =
    discount.type === "percentage"
      ? (subtotal * discount.value) / 100
      : discount.value;
  const discountTotal = Math.min(Math.max(rawDiscount || 0, 0), subtotal);

  const taxable = subtotal - discountTotal + (surcharge || 0);
  const vat = (taxable * (vatRate || 0)) / 100;

  return {
    subtotal,
    discount: discountTotal,
    surcharge: surcharge || 0,
    taxable,
    vat,
    total: taxable + vat,
  };
}

interface QuoteNumberSettings {
  quote_prefix: string;
  next_quote_number: number;
  quote_number_padding: number;
  quote_number_resets_yearly: boolean;
}

// Es.: PREV-2026-0001 (con reset annuale) oppure PREV-0001
export function formatQuoteNumber(
  settings: QuoteNumberSettings,
  date: Date = new Date(),
): string {
  const sequence = String(settings.next_quote_number).padStart(
    settings.quote_number_padding,
    "0",
  );

  return [
    settings.quote_prefix,
    settings.quote_number_resets_yearly ? String(date.getFullYear()) : "",
    sequence,
  ]
    .filter(Boolean)
    .join("-");
}

// Testo leggibile sopra un colore di sfondo (stessa soglia del backend)
export function readableTextColor(hex: string): "#111827" | "#FFFFFF" {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#111827";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#111827" : "#FFFFFF";
}
