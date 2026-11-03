import "server-only";

import type { ChartPoint, DashboardRange, KpisResult } from "./dashboard.types";

import { serverApi, authHeaders } from "../Services/server-api";

// recupero dati KPI
export async function getDashboardKpis(
  slug: string,
  range: DashboardRange = "30d",
): Promise<KpisResult> {
  try {
    const res = await serverApi.get<KpisResult>(
      `/api/companies/${encodeURIComponent(slug)}/dashboard/kpis`,
      {
        params: { range },
        headers: await authHeaders(),
      },
    );
    return res.data;
  } catch (error) {
    console.error("[dashboard] errore getDashboardKpis:", error);
    throw error;
  }
}

//recupero dati charts
export async function getDashboardChartsData(
  slug: string,
  range: DashboardRange = "30d",
): Promise<ChartPoint> {
  try {
    const res = await serverApi.get<KpisResult>(
      `/api/companies/${encodeURIComponent(slug)}/dashboard/chart`,
      {
        params: { range },
        headers: await authHeaders(),
      },
    );
    return res.data;
  } catch (error) {
    console.error("[dashboard] errore getDashboardKpis:", error.data);
    throw error;
  }
}

// recupero attività

