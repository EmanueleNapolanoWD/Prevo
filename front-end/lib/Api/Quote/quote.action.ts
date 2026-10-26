"use server";

import { revalidatePath } from "next/cache";
import type { QuotePayload } from "@/types/quote";
import {
  createQuote,
  deleteQuote,
  fetchQuoteById,
  fetchQuotes,
  getQuoteSettings,
  updateQuote,
} from "./quote.server";

// ============================================================================
// Letture
// ============================================================================
export async function getQuoteSettingsAction(slug: string) {
  return getQuoteSettings(slug);
}

export async function getQuotesAction(slug: string, page: number) {
  return fetchQuotes(slug, page);
}

export async function getQuoteAction(slug: string, quoteId: string) {
  return fetchQuoteById(slug, quoteId);
}

// ============================================================================
// Scritture: la cache si invalida solo se l'operazione è riuscita
// ============================================================================

export async function createQuoteAction(slug: string, payload: QuotePayload) {
  const res = await createQuote(slug, payload);

  if (res.ok) revalidatePath(`/${slug}/quotes`);

  return res;
}

export async function updateQuoteAction(
  slug: string,
  quoteId: string,
  payload: QuotePayload,
) {
  const res = await updateQuote(slug, quoteId, payload);

  if (res.ok) {
    revalidatePath(`/${slug}/quotes`);
    revalidatePath(`/${slug}/quotes/${quoteId}/edit`);
  }

  return res;
}

export async function deleteQuoteAction(slug: string, quoteId: string) {
  const res = await deleteQuote(slug, quoteId);

  if (res.ok) {
    revalidatePath(`/${slug}/quotes`);
  }

  return res;
}
