import "server-only";

import { serverApi, authHeaders } from "../Services/server-api";
import { CompanySettingsData, UpdateCompanyResult } from "@/types/company";
import { CompanyValues } from "@/types/company";
import { handleReadError, toApiFailure } from "../Services/errors";

const companyUrl = (slug: string) =>
  `/api/companies/${encodeURIComponent(slug)}`;

//==================COMPANY

//recupero company
export async function getCompany(slug: string): Promise<CompanyValues> {
  try {
    const res = await serverApi.get(companyUrl(slug), {
      headers: await authHeaders(),
    });
    return res.data.data ?? res.data;
  } catch (error) {
    handleReadError(error);
  }
}

// upload Company Data
export async function updateCompany(
  slug: string,
  payload: Record<string, string | null>,
): Promise<UpdateCompanyResult> {
  try {
    await serverApi.put(companyUrl(slug), payload, {
      headers: await authHeaders(),
    });
    return { ok: true };
  } catch (error) {
    return toApiFailure(error);
  }
}

//==================COMPANYSETTINGS

// recupero settaggi compnay
export default async function getCompanySettings(
  slug: string,
): Promise<CompanySettingsData> {
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
