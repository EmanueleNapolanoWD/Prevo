"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  ChartPoint,
  DashboardRange,
} from "@/lib/Api/Dashboard/dashboard.types";

const chartConfig = {
  sentValue: { label: "Inviati", color: "var(--primary)" },
  acceptedValue: { label: "Accettati", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const RANGE_LABEL: Record<DashboardRange, string> = {
  "7d": "negli ultimi 7 giorni",
  "30d": "negli ultimi 30 giorni",
  "90d": "negli ultimi 3 mesi, per settimana",
};

const eur = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});
const dayFmt = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
});

// "2026-11-03" -> Date locale (evita lo sfasamento di fuso che dà new Date("2026-11-03"))
const toDate = (iso: string) => new Date(`${iso}T00:00:00`);

const compactEur = (value: number) =>
  value >= 1000
    ? `€ ${(value / 1000).toLocaleString("it-IT", { maximumFractionDigits: 1 })}k`
    : `€ ${value}`;

export default function QuoteChart({
  data,
  range,
}: {
  data: ChartPoint[];
  range: DashboardRange;
}) {
  const weekly = range === "90d";
  const isEmpty =
    data.length === 0 ||
    data.every((p) => p.sentValue === 0 && p.acceptedValue === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Andamento preventivi</CardTitle>
        <CardDescription>
          Valore totale dei preventivi {RANGE_LABEL[range]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <TrendingUp
                className="size-5 text-muted-foreground"
                aria-hidden
              />
            </div>
            <p className="text-sm font-medium">
              Nessun dato disponibile per questo periodo
            </p>
            <p className="text-xs text-muted-foreground">
              Il grafico si popola quando invii o ti accettano dei preventivi.
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-64 w-full"
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ left: 0, right: 8, top: 8 }}
            >
              <defs>
                <linearGradient id="fillSent" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-sentValue)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-sentValue)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value: string) => dayFmt.format(toDate(value))}
              />
              <YAxis
                width={52}
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tickFormatter={compactEur}
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value: string) =>
                      `${weekly ? "Settimana del " : ""}${dayFmt.format(toDate(value))}`
                    }
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-6">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <span
                            className="size-2 rounded-full"
                            style={{ background: `var(--color-${name})` }}
                          />
                          {chartConfig[name as keyof typeof chartConfig]?.label}
                        </span>
                        <span className="font-mono font-medium tabular-nums">
                          {eur.format(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />

              <Area
                dataKey="sentValue"
                type="monotone"
                stroke="var(--color-sentValue)"
                strokeWidth={2}
                fill="url(#fillSent)"
              />
              <Area
                dataKey="acceptedValue"
                type="monotone"
                stroke="var(--color-acceptedValue)"
                strokeWidth={2}
                strokeDasharray="5 6"
                fill="none"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
