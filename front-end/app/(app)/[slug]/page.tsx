import { Suspense } from "react";
import { cookies } from "next/headers";

import PageHeader from "@/components/app/DashboardComponents/Home/sections/PageHeader";
import { RangeSelector } from "@/components/app/DashboardComponents/Home/sections/RangeSelector";
import { KpiSection } from "@/components/app/DashboardComponents/Home/sections/KpiSection";
import ToDoSection from "@/components/app/DashboardComponents/Home/sections/ToDoSection";

// import { RecentSection } from "@/components/app/DashboardComponents/Home/sections/RecentSection";
import { ChartSection } from "@/components/app/DashboardComponents/Home/sections/ChartSection";
import { Skeleton } from "@/components/ui/skeleton";
import { parseDashboardRange } from "@/lib/Api/Dashboard/dashboard.types";

import { getSessionUser } from "@/lib/Api/Auth/get-session-user";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const { slug } = await params;
  const query = await searchParams;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const [user] = await Promise.all([getSessionUser(cookieHeader)]);

  const range = parseDashboardRange(query.range);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="min-w-0 flex-1">
        <PageHeader user={user} />

        <main className="mx-auto max-w-[1500px] space-y-6 p-4 lg:space-y-8 lg:p-8">
          <div className="flex justify-end">
            <RangeSelector value={range} />
          </div>

          <Suspense key={`kpi-${range}`} fallback={<KpiSkeleton />}>
            <KpiSection slug={slug} range={range} />
          </Suspense>

          <Suspense
            key={`chart-${range}`}
            fallback={<Skeleton className="h-80 rounded-xl" />}
          >
            <ChartSection slug={slug} range={range} />
          </Suspense>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Suspense fallback={<Skeleton className="h-72 rounded-xl" />}>
              <ToDoSection slug={slug} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}
