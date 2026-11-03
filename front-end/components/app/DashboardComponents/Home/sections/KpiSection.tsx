
import { BookOpen, Check, FileText, Sparkles } from "lucide-react";

import StatCard from "../StatsCard";
import { getDashboardKpis } from "@/lib/Api/Dashboard/dashboard.server";
import type {
  DashboardRange,
  KpiValue,
} from "@/lib/Api/Dashboard/dashboard.types";

const eur = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const decimal = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
});

function deltaProps(kpi: KpiValue) {
  if (kpi.deltaPercent === null) return {};

  return {
    delta: `${decimal.format(Math.abs(kpi.deltaPercent))}%`,
    down: kpi.deltaPercent < 0,
    detail: "rispetto al periodo precedente",
  };
}

export async function KpiSection({
  slug,
  range,
}: {
  slug: string;
  range: DashboardRange;
}) {
  const { quoteSent, acceptanceRate, pipelineValue, acceptedValue } =
    await getDashboardKpis(slug, range);


  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Preventivi inviati"
        value={String(quoteSent.value)}
        {...deltaProps(quoteSent)}
      >
        <FileText className="h-5 w-5" />
      </StatCard>

      <StatCard
        label="Tasso di accettazione"
        value={`${decimal.format(acceptanceRate.value)}%`}
        {...deltaProps(acceptanceRate)}
      >
        <Check className="h-5 w-5" />
      </StatCard>

      <StatCard
        label="Valore in attesa"
        value={eur.format(pipelineValue.value)}
        detail="preventivi in attesa di risposta"
      >
        <BookOpen className="h-5 w-5" />
      </StatCard>

      <StatCard
        label="Accettato nel periodo"
        value={eur.format(acceptedValue.value)}
        {...deltaProps(acceptedValue)}
      >
        <Sparkles className="h-5 w-5" />
      </StatCard>
    </div>
  );
}
