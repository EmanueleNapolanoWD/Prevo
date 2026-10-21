import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { QuoteItem } from "@/types/quote";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// UTILS PER CLIENTS
export function buildListHref(slug: string, filters: { q?: string; tipo?: string }, page?: number) {
  const params = new URLSearchParams()
  if (filters.q) params.set("q", filters.q)
  if (filters.tipo) params.set("tipo", filters.tipo)
  if (page && page > 1) params.set("page", String(page))
  const query = params.toString()
  return `/${slug}/clients${query ? `?${query}` : ""}`
}

// UTILS per QUOTE


// Accetta anche la virgola decimale ("12,50"). Stringa vuota => NaN
export function parseNumber(value: string): number {
  const v = value.trim().replace(",", ".");
  return v === "" ? NaN : Number(v);
}

export function calcLineTotal(
  item: Pick<QuoteItem, "quantity" | "unit_price" | "discount">,
): number {
  const total = item.quantity * item.unit_price * (1 - item.discount / 100);
  return Math.round(total * 100) / 100;
}
