
import { cookies } from "next/headers";
import axios from "axios";
import type { CurrentUser } from "@/types/auth";

import { serverApi } from "../Services/server-api";

type DashboardRange = "7d" | "30d" | "90d";

export interface KpiValue {
  value: number | null;
  previousValue: number | null;
  deltaPercent: number | null;
}

export interface KpisResult {
  quotesSent: KpiValue;
  acceptanceRate: KpiValue;
  pipelineValue: KpiValue;
  acceptedValue: KpiValue;
}

export interface TodoItem {
  id: string;
  number: string;
  customerName: string;
  total: number;
  reason: string;
  detail: string;
  date: string;
}

export interface ChartPoint {
  date: string;
  sentValue: number;
  acceptedValue: number;
}

export interface InsightsResult {
  topCustomers: { name: string; acceptedValue: number; acceptedCount: number }[];
  topCatalogItems: { name: string; timesUsed: number; totalQuantity: number }[];
  teamPerformance: { id: string; name: string; role: string; created: number; sent: number; accepted: number; acceptanceRate: number }[];
  onboarding: { id: string; label: string; completed: boolean }[];
}

export async function getDashboardKpis(slug: string, range: DashboardRange = "30d"): Promise<KpisResult> {
  try {
    const res = await serverApi.post<KpisResult>(
      `/api/companies/${slug}/dashboard/kpis`,
      { range },
      { headers: await authHeaders() }
    );

    return res.data;
  } catch (error) {
    console.error("[dashboard] errore getDashboardKpis:", error);
    throw error;
  }
}

export async function getDashboardTodos(slug: string): Promise<TodoItem[]> {
  try {
    const res = await serverApi.post<TodoItem[]>(
      `/api/companies/${slug}/dashboard/todos`,
      {},
      { headers: await authHeaders() }
    );

    return res.data;
  } catch (error) {
    console.error("[dashboard] errore getDashboardTodos:", error);
    throw error;
  }
}

export async function getDashboardRecent(slug: string, limit: number = 8): Promise<{
  id: string;
  number: string;
  customerName: string;
  total: number;
  status: string;
  validUntil: string | null;
}[]> {
  try {
    const res = await serverApi.post<{
      data: { id: string; number: string; customerName: string; total: number; status: string; validUntil: string | null }[];
    }>(
      `/api/companies/${slug}/dashboard/recent`,
      { limit },
      { headers: await authHeaders() }
    );

    return res.data.data;
  } catch (error) {
    console.error("[dashboard] errore getDashboardRecent:", error);
    throw error;
  }
}

export async function getDashboardChart(slug: string, range: DashboardRange = "30d"): Promise<ChartPoint[]> {
  try {
    const res = await serverApi.post<ChartPoint[]>(
      `/api/companies/${slug}/dashboard/chart`,
      { range },
      { headers: await authHeaders() }
    );

    return res.data;
  } catch (error) {
    console.error("[dashboard] errore getDashboardChart:", error);
    throw error;
  }
}

export async function getDashboardInsights(slug: string): Promise<InsightsResult> {
  try {
    const res = await serverApi.post<InsightsResult>(
      `/api/companies/${slug}/dashboard/insights`,
      {},
      { headers: await authHeaders() }
    );

    return res.data;
  } catch (error) {
    console.error("[dashboard] errore getDashboardInsights:", error);
    throw error;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;

  return {
    Cookie: cookieStore.toString(),
    ...(xsrfToken ? { "X-XSRF-TOKEN": decodeURIComponent(xsrfToken) } : {}),
  };
}
