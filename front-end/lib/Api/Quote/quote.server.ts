'use server'

import { QuoteSettingsData } from "@/types/quote";
import { serverApi } from "../Services/server-api";
import { authHeaders } from "../Services/server-api";
import { handleReadError } from "../Services/errors";

const companyUrl = (slug: string) =>
  `/api/companies/${encodeURIComponent(slug)}`;

// recupero settaggi compnay
export default async function getQuoteSettings(
  slug: string,
): Promise<QuoteSettingsData> {
  try {
    const res = await serverApi.get(`${companyUrl(slug)}/settings`, {
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