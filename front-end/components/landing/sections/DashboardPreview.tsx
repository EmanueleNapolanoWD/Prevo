import Link from "next/link";
import { cn } from "cn";
import {
  LANDING,
  type TableRow,
  type LegendItem,
  type Kpi,
} from "@/components/landing/landing.data";
import { DashboardChart } from "@/components/landing/sections/DashboardChart";
import { ButtonLink } from "@/components/landing/ui/ButtonLink";
import { Icon } from "@/components/landing/ui/Icon";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", active: true },
  { label: "Preventivi" },
  { label: "Clienti" },
  { label: "Prodotti" },
  { label: "Assistente AI" },
];

function StatusBadge({ stato }: { stato: TableRow["stato"] }) {
  const isAccettato = stato === "accettato";
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
        isAccettato
          ? "border-prepo-primary/20 bg-prepo-primary/10 text-prepo-primary"
          : "border-[#F5D47A]/40 bg-[#F5D47A]/15 text-[#8A6D1A]"
      )}
    >
      {isAccettato ? "Accettato" : "In attesa"}
    </span>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="rounded-xl border border-[var(--prepo-border)] bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-prepo-text">
        {kpi.label}
      </p>
      <p className="mt-1 text-lg font-bold text-prepo-ink">{kpi.value}</p>
      <p className="text-xs text-prepo-text">{kpi.sub}</p>
    </div>
  );
}

function LegendRow({ item }: { item: LegendItem }) {
  const colors = {
    green: "bg-prepo-primary",
    yellow: "bg-[#F5D47A]",
    gray: "bg-[#C9D4CE]",
  };
  return (
    <li className="flex items-center gap-2 text-sm text-prepo-ink">
      <span className={`h-2.5 w-2.5 rounded-full ${colors[item.color]}`} />
      <span className="mr-auto">{item.label}</span>
      <span className="text-prepo-text">{item.value}</span>
    </li>
  );
}

function TableCard() {
  return (
    <div className="rounded-xl border border-[var(--prepo-border)] bg-white overflow-hidden shadow-sm">
      <div className="border-b border-[var(--prepo-border)] bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-prepo-ink">Ultimi preventivi</h3>
          <Link
            href="#"
            className="text-xs font-medium text-prepo-primary underline underline-offset-2 hover:underline-offset-4"
          >
            Vedi tutti →
          </Link>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-wider text-prepo-text">
              <th className="text-left px-6 py-3">Numero</th>
              <th className="text-left px-6 py-3">Cliente</th>
              <th className="text-right px-6 py-3">Importo</th>
              <th className="text-left px-6 py-3">Stato</th>
              <th className="text-left px-6 py-3 hidden md:table-cell">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--prepo-border)]">
            {LANDING.tableRows.map((row) => (
              <tr key={row.numero} className="text-prepo-ink">
                <td className="px-6 py-4">{row.numero}</td>
                <td className="px-6 py-4">{row.cliente}</td>
                <td className="px-6 py-4 text-right">{row.importo}</td>
                <td className="px-6 py-4"><StatusBadge stato={row.stato} /></td>
                <td className="px-6 py-4 text-prepo-text hidden md:table-cell">
                  {row.data}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export function DashboardPreview() {
  return (
    <div className="mx-auto w-full">
      <div
        role="img"
        aria-label="Anteprima della dashboard di Prevo: barra laterale Workspace, schede KPI preventivi, grafico andamento preventivi, legenda stati e tabella degli ultimi preventivi"
        className="block"
      >
        <div
          className="rounded-2xl border border-[var(--prepo-border)] bg-white shadow-xl prepo-shadow overflow-hidden"
          aria-hidden="true"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar: solo desktop */}
            <aside className="hidden lg:flex lg:w-64 flex-col border-r border-[var(--prepo-border)] bg-prepo-bg/50 p-4">
              <div className="mb-8">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded bg-prepo-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-prepo-text">
                    prevo
                  </span>
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-prepo-text mb-4">
                Workspace
              </p>
              <nav className="space-y-0.5">
                {SIDEBAR_ITEMS.map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                      item.active
                        ? "bg-prepo-primary text-white"
                        : "text-prepo-text hover:bg-prepo-bg hover:text-prepo-ink"
                    )}
                  >
                    <Icon
                      name={item.label === "Dashboard" ? "BarChart3" : "FileText"}
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    {item.label}
                  </div>
                ))}
              </nav>
              <div className="mt-auto pt-6 border-t border-[var(--prepo-border)] space-y-3">
                <div className="rounded-lg bg-prepo-primary/10 p-3 text-prepo-text text-xs leading-relaxed">
                  Il tuo prossimo preventivo? Prova a descriverlo all&apos;AI.
                  <div className="mt-2">
                    <Link
                      href="#"
                      className="text-prepo-primary font-medium underline underline-offset-2 hover:underline-offset-4"
                    >
                      Apri l&apos;assistente ↗
                    </Link>
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-prepo-text">
                  Impostazioni
                </p>
              </div>
            </aside>
            <div className="flex-1">
              <header className="p-6 border-b border-[var(--prepo-border)]">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <p className="text-prepo-text text-xs">Buongiorno, Marco</p>
                    <p className="text-prepo-ink font-semibold">
                      Ecco come sta andando la tua attività.
                    </p>
                  </div>
                  <div className="flex flex-col lg:flex-row items-end gap-3">
                    <ButtonLink variant="primary" size="sm">
                      + Nuovo preventivo
                    </ButtonLink>
                    <div className="flex items-center gap-1.5 rounded-lg border border-[var(--prepo-border)] px-2.5 py-1.5">
                      <span className="text-sm">Edilnova S.r.l.</span>
                      <span className="text-[10px] text-prepo-text">⌄</span>
                    </div>
                  </div>
                </div>
              </header>

              <div className="p-6 lg:p-8">
                {/* KPI */}
                <div className="grid gap-4 lg:grid-cols-4">
                  {LANDING.kpis.map((kpi) => (
                    <KpiCard key={kpi.label} kpi={kpi} />
                  ))}
                </div>

                {/* Grafico + legenda (nascosti su mobile) */}
                <div className="mt-8 lg:mt-12 hidden lg:flex gap-6">
                  <div className="flex-1 rounded-xl border border-[var(--prepo-border)] bg-white p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-prepo-ink">
                        {LANDING.chartLabel}
                      </h3>
                      <span className="text-[10px] text-prepo-text border border-prepo-border/40 rounded px-2 py-0.5">
                        {LANDING.chartDropdown}
                      </span>
                    </div>
                    <div className="h-48 w-full">
                      <DashboardChart
                        points={LANDING.chartPoints}
                        label="Andamento preventivi negli ultimi 6 mesi"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-64 rounded-xl border border-[var(--prepo-border)] bg-white p-6">
                    <h3 className="text-sm font-bold text-prepo-ink mb-4">
                      Tutto sotto controllo
                    </h3>
                    <ul className="space-y-3">
                      {LANDING.legend.map((item) => (
                        <LegendRow key={item.label} item={item} />
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tabella */}
                <div className="mt-8 lg:mt-12">
                  <TableCard />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vista mobile: solo header, KPI e tabella */}
        <div className="lg:hidden mt-6 rounded-2xl border border-[var(--prepo-border)] bg-white shadow-sm prepo-shadow overflow-hidden">
          <header className="p-4 border-b border-[var(--prepo-border)]">
            <p className="text-prepo-text text-xs">Buongiorno, Marco</p>
            <p className="text-prepo-ink font-semibold">
              Ecco come sta andando la tua attività.
            </p>
          </header>
          <div className="grid gap-4 p-4 grid-cols-2">
            {LANDING.kpis.map((kpi) => (
              <div key={kpi.label} className="rounded-lg border border-[var(--prepo-border)] bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-prepo-text">
                  {kpi.label}
                </p>
                <p className="mt-1 text-base font-bold text-prepo-ink">
                  {kpi.value}
                </p>
                <p className="text-[10px] text-prepo-text">{kpi.sub}</p>
              </div>
            ))}
          </div>
          <TableCard />
        </div>
      </div>
    </div>
  );
}


