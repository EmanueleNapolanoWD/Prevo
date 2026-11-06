import 'server-only'

import { serverApi, authHeaders } from "../Services/server-api";
import type { QuoteSettingsData } from "@/lib/Utility/QuoteSettings/quote-settings.types";
import { handleReadError } from "../Services/errors";


const quoteSettingsUrl = (slug: string) =>
  `/api/companies/${encodeURIComponent(slug)}/quote-settings`;

// ============================================================================
// Letture
// ============================================================================

// recupero settaggi company
export async function getQuoteSettings(
  slug: string,
): Promise<QuoteSettingsData> {
  try {
    const res = await serverApi.get(`${quoteSettingsUrl(slug)}`, {
      headers: await authHeaders(),
    });
    
    const settings = res.data.data ?? res.data;

    return {
      ...settings,
      default_vat_rate: Number(settings.default_vat_rate),
    };
  } catch (error) {
    handleReadError(error);
  }
}
