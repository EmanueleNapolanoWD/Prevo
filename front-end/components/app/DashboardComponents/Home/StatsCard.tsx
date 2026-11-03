"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  children: ReactNode;
  label: string;
  value: string;
  delta?: string;
  detail?: string;
  down?: boolean;
}

export default function StatCard({
  children,
  label,
  value,
  delta,
  detail,
  down,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {children}
        </div>

        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              down ? "text-destructive" : "text-primary",
            )}
          >
            {down ? (
              <ArrowDownRight className="size-3.5" />
            ) : (
              <ArrowUpRight className="size-3.5" />
            )}
            {delta}
          </span>
        )}
      </div>

      <p className="mt-5 text-sm text-muted-foreground">{label}</p>

      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>

      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </div>
  );
}
