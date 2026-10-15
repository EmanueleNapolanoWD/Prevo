'use server'

import "server-only";

import { serverApi, authHeaders } from "../../server-api";
import { CompanySettingsData } from "@/types/company";

export default async function getCompanySettings(
    slug: string
): Promise<CompanySettingsData | null> {
    const res = await serverApi.get(
        `/api/companies/${encodeURIComponent(slug)}/settings`,
        {
            headers: await authHeaders(),
        }
    );

    const settings = res.data.data ?? res.data;

    return {
        ...settings,
        default_vat_rate: Number(settings.default_vat_rate),
    };
}
