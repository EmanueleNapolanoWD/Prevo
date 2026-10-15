import { Company, CompanySettingsData } from "@/types/company";
import { api } from "../../api";

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

export async function updateCompanyData(slug: string, data: Company) {
  const res = await api.put(`/api/companies/${encodeURIComponent(slug)}`, data);

  return res.data.data ?? res.data;
}
