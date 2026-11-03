import { cn } from "@/lib/utils";
import {
  FileText,
  Bell,
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Package,
} from "lucide-react";

interface ToDoSectionProps {
  slug: string;
}

export default function ToDoSection({ slug }: ToDoSectionProps) {
  const activities = [
    {
      icon: Bell,
      label: "Sollecitare",
      title: "Sito web aziendale",
      detail: "Visualizzato 3 giorni fa",
      amount: "€ 6.800,00",
      tone: "bg-muted text-muted-foreground",
    },
    {
      icon: FileText,
      label: "In scadenza",
      title: "Impianto elettrico ufficio",
      detail: "Scade tra 4 giorni",
      amount: "€ 12.200,00",
      tone: "bg-primary/10 text-primary",
    },
    {
      icon: Sparkles,
      label: "Bozza ferma",
      title: "Consulenza strategica Q4",
      detail: "Aggiornata 8 giorni fa",
      amount: "€ 3.500,00",
      tone: "bg-secondary text-secondary-foreground",
    },
  ];

  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold tracking-tight">Da fare adesso</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Le attività che richiedono attenzione
          </p>
        </div>
        <button className="text-sm font-medium text-primary hover:underline">
          Vedi tutti
        </button>
      </div>
      <div className="mt-5 divide-y divide-border">
        {activities.map(
          ({ icon: Icon, label, title, detail, amount, tone }) => (
            <button
              key={title}
              className="flex min-w-0 w-full items-center gap-3 py-3 text-left transition-colors first:pt-0 last:pb-0 hover:bg-muted/40"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">{title}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      tone,
                    )}
                  >
                    {label}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
              </div>
              <span className="text-sm font-medium tabular-nums">{amount}</span>
            </button>
          ),
        )}
      </div>
    </section>
  );
}
