"use server"

import { getQuoteSettings } from "./quote-settings.server";

// ============================================================================
// Letture
// ============================================================================
export async function getQuoteSettingsAction(slug: string) {
  return getQuoteSettings(slug);
}
