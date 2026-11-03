import { Suspense } from "react";

import {
  getDashboardKpis,
  getDashboardTodos,
  getDashboardRecent,
  getDashboardChart,
  getDashboardInsights,
} from "@/lib/Api/Dashboard/dashboard.server";
import { getCurrentUser } from "@/lib/Api/Auth/auth.server";

import DashboardKpiCards from "@/components/app/DashboardComponents/Home/DashboardKpiCards";
import DashboardChart from "@/components/app/DashboardComponents/Home/DashboardChart";
import ActionsToDo from "@/components/app/DashboardComponents/Home/ActionsToDo";
import RecentQuotes from "@/components/app/DashboardComponents/Home/RecentQuotes";
import DashboardInsights from "@/components/app/DashboardComponents/Home/DashboardInsights";
import styles from "./page.module.css";

type DashboardRange = "7d" | "30d" | "90d";

// ── Server section components: ognuno carica i propri dati in modo indipendente ──
// Così Suspense può mostrare uno stato di caricamento distinto per ogni sezione.

async function KpiSection({ slug, range }: { slug: string; range: string }) {
  const kpis = await getDashboardKpis(slug, range as DashboardRange).catch(
    () => null,
  );
  return <DashboardKpiCards kpis={kpis ?? undefined} range={range} />;
}

async function ChartSection({ slug, range }: { slug: string; range: string }) {
  const chart = await getDashboardChart(slug, range as DashboardRange).catch(
    () => null,
  );
  return <DashboardChart chart={chart ?? undefined} range={range} />;
}

async function ActionsSection({ slug }: { slug: string }) {
  const todos = await getDashboardTodos(slug).catch(() => null);
  return <ActionsToDo todos={todos ?? undefined} />;
}

async function RecentSection({ slug }: { slug: string }) {
  const recent = await getDashboardRecent(slug, 8).catch(() => null);
  return <RecentQuotes recent={recent ?? undefined} />;
}

async function InsightsSection({
  slug,
  isOwner,
}: {
  slug: string;
  isOwner: boolean;
}) {
  const insights = await getDashboardInsights(slug).catch(() => null);
  if (!isOwner || !insights) return null;
  return <DashboardInsights insights={insights} isOwner={isOwner} />;
}

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { slug } = await params;
  const { range: rangeParam } = await searchParams;
  const range =
    rangeParam === "7d" || rangeParam === "90d" ? rangeParam : "30d";

  // Verifica se l'utente è OWNER della compagnia
  let isOwner = false;
  try {
    const user = await getCurrentUser();
    const membership = user.companies.find((c) => c.slug === slug);
    isOwner = membership?.role === "OWNER";
  } catch {
    // utente non autenticato -> isOwner resta false
  }

  return (
    <main className={styles.page}>
      <div className={styles.section}>
        {/* Riga KPI */}
        <Suspense
          fallback={<div className={styles.skeleton}>Caricamento KPI…</div>}
        >
          <KpiSection slug={slug} range={range} />
        </Suspense>

        {/* Grafico */}
        <Suspense
          fallback={<div className={styles.skeleton}>Caricamento grafico…</div>}
        >
          <ChartSection slug={slug} range={range} />
        </Suspense>

        {/* Da fare adesso + Ultimi preventivi (griglia 2 colonne) */}
        <div className={styles.grid}>
          <Suspense fallback={<div className={styles.skeleton}>Caricamento attività…</div>}>
            <ActionsSection slug={slug} />
          </Suspense>
          <Suspense fallback={<div className={styles.skeleton}>Caricamento preventivi…</div>}>
            <RecentSection slug={slug} />
          </Suspense>
        </div>

        {/* Insights (solo OWNER) */}
        {isOwner && (
          <Suspense fallback={<div className={styles.skeleton}>Caricamento insights…</div>}>
            <InsightsSection slug={slug} isOwner={isOwner} />
          </Suspense>
        )}
      </div>
    </main>
  );
}
