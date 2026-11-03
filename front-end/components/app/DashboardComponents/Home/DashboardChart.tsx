"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
} from "recharts";
import { ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import styles from "./dashboard-chart.module.css";

interface ChartPoint {
  date: string;
  sentValue: number;
  acceptedValue: number;
}

interface DashboardChartProps {
  chart: ChartPoint[] | null | undefined;
  range: string;
}

export default function DashboardChart({ chart, range }: DashboardChartProps) {
  const [selectedRange, setSelectedRange] = useState(range);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>Andamento preventivi</div>
        <Select
          onValueChange={(value) =>
            setSelectedRange(
              (value ?? range) as "7d" | "30d" | "90d"
            )
          }
          defaultValue={range}
        >
          <SelectTrigger className={styles.selectTrigger}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Ultimo 7 giorni</SelectItem>
            <SelectItem value="30d">Ultimo 30 giorni</SelectItem>
            <SelectItem value="90d">Ultimo 3 mesi</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className={styles.content}>
        {!chart || chart.length === 0 ? (
          <div className={styles.empty}>
            Nessun dato disponibile per questo periodo
          </div>
        ) : (
          <div className={styles.chartWrapper}>
            <AreaChart data={chart}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
              <Tooltip content={<ChartTooltipContent indicator="dot" />} />
              <Area
                dataKey="sentValue"
                type="natural"
                fill="rgba(98, 176, 131, 0.1)"
                stroke="var(--ds-primary)"
                stackId="a"
                name="Preventivi inviati"
              />
              <Area
                dataKey="acceptedValue"
                type="natural"
                fill="rgba(63, 130, 80, 0.1)"
                stroke="var(--ds-accent-foreground)"
                stackId="a"
                name="Preventivi accettati"
              />
            </AreaChart>
          </div>
        )}
      </div>
    </div>
  );
}
