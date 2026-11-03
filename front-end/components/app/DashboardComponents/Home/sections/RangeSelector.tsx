"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import type { DashboardRange } from "@/lib/Api/Dashboard/dashboard.types";

const OPTIONS: { value: DashboardRange; label: string }[] = [
  { value: "7d", label: "7 giorni" },
  { value: "30d", label: "30 giorni" },
  { value: "90d", label: "3 mesi" },
];

export function RangeSelector({ value }: { value: DashboardRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function select(next: DashboardRange) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", next);
    startTransition(() =>
      router.replace(`${pathname}?${params}`, { scroll: false }),
    );
  }

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border bg-card p-1",
        pending && "opacity-70",
      )}
      role="group"
      aria-label="Periodo"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => select(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            value === o.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
