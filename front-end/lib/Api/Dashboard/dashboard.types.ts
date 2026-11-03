export type DashboardRange = "7d" | "30d" | "90d";

export const DASHBOARD_RANGES: readonly DashboardRange[] = ["7d", "30d", "90d"];
export const DEFAULT_DASHBOARD_RANGE: DashboardRange = "30d";

/** Valida il valore di ?range= (può essere undefined, stringa o array). */
export function parseDashboardRange(
  value: string | string[] | undefined
): DashboardRange {
  const v = Array.isArray(value) ? value[0] : value;
  return DASHBOARD_RANGES.includes(v as DashboardRange)
    ? (v as DashboardRange)
    : DEFAULT_DASHBOARD_RANGE;
}

export interface KpiValue {
  value: number;
  previousValue: number | null;
  deltaPercent: number | null; // null = non calcolabile, nascondi il badge
}

export interface KpisResult {
  quoteSent: KpiValue;
  acceptanceRate: KpiValue;
  pipelineValue: KpiValue;
  acceptedValue: KpiValue;
}

export type TodoReason = "expiring" | "no_reply" | "stale_draft";

export interface TodoItem {
  id: string;
  number: string;
  customerName: string;
  total: number;
  reason: TodoReason;
  detail: string;
  date: string;
}

export interface RecentQuote {
  id: string;
  number: string;
  customerName: string;
  total: number;
  status: string; // se hai il tipo QuoteStatus nel frontend, usa quello
  validUntil: string | null;
}

export interface ChartPoint {
  date: string;
  sentValue: number;
  acceptedValue: number;
}

export interface InsightsResult {
  topCustomers: { name: string; acceptedValue: number; acceptedCount: number }[];
  topCatalogItems: { name: string; timesUsed: number; totalQuantity: number }[];
  teamPerformance: {
    id: string;
    name: string;
    role: string;
    created: number;
    sent: number;
    accepted: number;
    acceptanceRate: number;
  }[];
  onboarding: { id: string; label: string; completed: boolean }[];
}