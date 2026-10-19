import { CompanySettingsData } from "@/types/company";
import { api } from "../Services/api";

export async function updateCompanySettings(
  slug: string,
  data: CompanySettingsData,
) {
  const res = await api.put(
    `/api/companies/${encodeURIComponent(slug)}/settings`,
    data,
  );

  return res.data.data ?? res.data;
}

