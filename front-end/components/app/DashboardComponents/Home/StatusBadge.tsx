"use client";

import { cn } from "@/lib/utils";

export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Accettato: "bg-primary/10 text-primary",
    Inviato: "bg-secondary text-secondary-foreground",
    Visualizzato: "bg-muted text-muted-foreground",
    Bozza: "bg-accent text-accent-foreground",
    Rifiutato: "bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        styles[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
