'use client'

import StatCard from "./StatsCard";
import PageHeader from "./sections/PageHeader";
import StatusBadge from "./StatusBadge";
import QuoteChart from "./QuoteChart";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import {
  Bell,
  FileText,
  Sparkles,
  Check,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";






export default function DashboardShell() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="min-w-0 flex-1">
          
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            
            <section className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold tracking-tight">
                    Ultimi preventivi
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    I preventivi aggiornati di recente
                  </p>
                </div>
                <button className="text-sm font-medium text-primary hover:underline">
                  Vedi tutti
                </button>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[540px] text-left">
                  <thead>
                    <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="pb-3 font-medium">Preventivo</th>
                      <th className="pb-3 font-medium">Cliente</th>
                      <th className="pb-3 text-right font-medium">Importo</th>
                      <th className="pb-3 pl-4 font-medium">Stato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {quotes.slice(0, 3).map((quote) => (
                      <tr
                        key={quote.number}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className="py-3">
                          <p className="text-sm font-medium">{quote.title}</p>
                          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                            {quote.number}
                          </p>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {quote.client}
                        </td>
                        <td className="py-3 text-right text-sm font-medium tabular-nums">
                          {quote.total}
                        </td>
                        <td className="py-3 pl-4">
                          <StatusBadge status={quote.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold tracking-tight">I tuoi insight</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Una panoramica sulle aree che stanno crescendo
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">
                Approfondisci <ArrowUpRight className="size-3.5" />
              </Button>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Clienti ricorrenti
                  </span>
                  <span className="font-medium">72%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-full w-[72%] rounded-full bg-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  +12% rispetto allo scorso mese
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Catalogo utilizzato
                  </span>
                  <span className="font-medium">58%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-full w-[58%] rounded-full bg-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  8 prodotti usati questo mese
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Obiettivo mensile
                  </span>
                  <span className="font-medium">84%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div className="h-full w-[84%] rounded-full bg-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  € 5.450 per raggiungere l&apos;obiettivo
                </p>
              </div>
            </div>
          </section>
      </div>
}
