import type { QuoteSettingsData } from "@/lib/Utility/QuoteSettings/quote-settings.types";
import { api } from "../Services/api";

const settingsUrl = (slug: string) =>
  `/api/companies/${encodeURIComponent(slug)}/quote-settings`;

export async function updateQuoteSettings(
  slug: string,
  data: QuoteSettingsData,
) {
  const res = await api.put(settingsUrl(slug), data);

  return res.data.data ?? res.data;
}
