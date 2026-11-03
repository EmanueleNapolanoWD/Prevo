"use client";

import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import styles from "./dashboard-kpi-cards.module.css";

interface KpiCardProps {
  label: string;
  value: number | null;
  previousValue: number | null;
  deltaPercent: number | null;
  suffix?: string;
}

function KpiCard({ label, value, previousValue, deltaPercent, suffix = "" }: KpiCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>
          {value !== null ? `${value}${suffix}` : "—"}
        </div>
        <div className={styles.description}>{label}</div>
      </div>
      {deltaPercent !== null && (
        <div className={styles.footer}>
          <Badge variant="outline" className={deltaPercent > 0 ? styles.positive : styles.negative}>
            {deltaPercent > 0 ? <TrendingUpIcon className={styles.icon} /> : <TrendingDownIcon className={styles.icon} />}
            {deltaPercent > 0 ? `+${deltaPercent}%` : `${deltaPercent}%`}
          </Badge>
        </div>
      )}
    </div>
  );
}

interface DashboardKpiCardsProps {
  range: string;
  kpis: {
    quotesSent: { value: number | null; previousValue: number | null; deltaPercent: number | null };
    acceptanceRate: { value: number | null; previousValue: number | null; deltaPercent: number | null };
    pipelineValue: { value: number | null; previousValue: number | null; deltaPercent: number | null };
    acceptedValue: { value: number | null; previousValue: number | null; deltaPercent: number | null };
  } | null | undefined;
}

export default function DashboardKpiCards({ kpis }: DashboardKpiCardsProps) {
  if (!kpis) return null;

  return (
    <div className={styles.root}>
      <KpiCard
        label="Preventivi inviati"
        value={kpis.quotesSent.value}
        previousValue={kpis.quotesSent.previousValue}
        deltaPercent={kpis.quotesSent.deltaPercent}
        suffix=" preventivi"
      />
      <KpiCard
        label="Tasso accettazione"
        value={kpis.acceptanceRate.value !== null ? Math.round(kpis.acceptanceRate.value) : null}
        previousValue={kpis.acceptanceRate.previousValue}
        deltaPercent={kpis.acceptanceRate.deltaPercent}
        suffix="%"
      />
      <KpiCard
        label="Valore in attesa"
        value={kpis.pipelineValue.value}
        previousValue={kpis.pipelineValue.previousValue}
        deltaPercent={kpis.pipelineValue.deltaPercent}
        suffix="€"
      />
      <KpiCard
        label="Preventivi accettati"
        value={kpis.acceptedValue.value}
        previousValue={kpis.acceptedValue.previousValue}
        deltaPercent={kpis.acceptedValue.deltaPercent}
        suffix="€"
      />
    </div>
  );
}
