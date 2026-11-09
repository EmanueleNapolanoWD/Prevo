"use server";

import { revalidatePath } from "next/cache";
import type { QuotePayload } from "@/lib/Utility/Quote/quote.types";
import {
  createQuote,
  deleteQuote,
  fetchQuoteById,
  fetchQuotes,
  updateQuote,
  generateQuoteAiDraft,
} from "./quote.server";

// ============================================================================
// Letture
// ============================================================================

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

// ============================================================================
// AI: genera una bozza, non salva e non invalida nessuna cache
// ============================================================================

export async function generateQuoteDraftAction(slug: string, prompt: string) {
  const text = prompt.trim();

  // evita una chiamata inutile (e quota AI sprecata) per richieste troppo brevi
  if (text.length < 10) {
    return {
      ok: false as const,
      status: 422,
      message: "Aggiungi qualche dettaglio in più (almeno 10 caratteri).",
    };
  }

  const res = await generateQuoteAiDraft(slug, text);

  return res;
}
