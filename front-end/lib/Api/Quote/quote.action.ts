"use server";

import { Quote, QuotePayload } from "@/types/quote";
import { getQuoteSettings, sendPayloadQuote } from "./quote.server";

export async function getQuoteSettingsAction(slug: string) {
  return getQuoteSettings(slug);
}

export async function createQuoteAction(
  slug: string,
  payload: QuotePayload,
): Promise<Quote | { ok: false; message: string }> {
  return await sendPayloadQuote(slug, payload);
}
