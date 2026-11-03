import QuoteChart from "../QuoteChart";
import { getDashboardChartsData } from "@/lib/Api/Dashboard/dashboard.server";
import type { DashboardRange } from "@/lib/Api/Dashboard/dashboard.types";

export async function ChartSection({
  slug,
  range,
}: {
  slug: string;
  range: DashboardRange;
}) {
  const data = await getDashboardChartsData(slug, range);
  return <QuoteChart data={data} range={range} />;
}
