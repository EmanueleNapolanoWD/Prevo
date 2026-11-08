import Link from "next/link";
import { Plus, FileText, Search, SlidersHorizontal, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { QuoteActionsCell } from "@/components/app/DashboardComponents/Quotes/QuoteList/QuoteActionsCell";
import { getQuotesAction } from "@/lib/Api/Quote/quote.action";
import styles from "@/components/app/shared/list-page.module.css";

type QuotesPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

const QUOTE_STATUS_OPTIONS = [
  { value: "all", label: "Tutti gli stati" },
  { value: "DRAFT", label: "Bozza" },
  { value: "SENT", label: "Inviato" },
  { value: "VIEWED", label: "Visualizzato" },
  { value: "ACCEPTED", label: "Accettato" },
  { value: "REJECTED", label: "Rifiutato" },
  { value: "EXPIRED", label: "Scaduto" },
];

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; bg: string }> = {
  DRAFT: { label: "Bozza", variant: "secondary", bg: "bg-amber-50/50" },
  SENT: { label: "Inviato", variant: "default", bg: "bg-blue-50/50" },
  VIEWED: { label: "Visualizzato", variant: "default", bg: "bg-blue-50/50" },
  ACCEPTED: { label: "Accettato", variant: "default", bg: "bg-emerald-50/50" },
  REJECTED: { label: "Rifiutato", variant: "destructive", bg: "bg-slate-50/50" },
  EXPIRED: { label: "Scaduto", variant: "secondary", bg: "bg-slate-50/50" },
};

function formatCurrency(value: number | string | null) {
  if (value === null || value === undefined) return "—";
  return Number(value).toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}

export default async function QuotesPage({ params, searchParams }: QuotesPageProps) {
  const { slug } = await params;
  const filters = await searchParams;
  const currentPage = Math.max(1, Number(filters.page) || 1);
  const quotes = await getQuotesAction(slug, currentPage);

  const items = quotes?.data ?? [];
  const lastPage = quotes?.meta?.last_page ?? 1;
  const hasFilters = Boolean(filters.q || filters.status);

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.eyebrow}>GESTIONE PREVENTIVI</div>
          <h1 className={styles.pageTitle}>Preventivi</h1>
          <p className={styles.pageDescription}>Gestisci e monitora tutti i tuoi preventivi in un unico posto.</p>
        </div>
        <Button size="lg" className={styles.newButton} render={<Link href={`/${slug}/quotes/create`} />}>
          <Plus data-icon="inline-start" /> Nuovo preventivo
        </Button>
      </header>

      <div className={styles.toolbar}>
        <form className={styles.filters} method="get">
          <div className={styles.searchField}>
            <Search aria-hidden="true" />
            <Input name="q" type="search" defaultValue={filters.q ?? ""} placeholder="Cerca preventivi…" aria-label="Cerca preventivi" />
          </div>
          <Select name="stato" defaultValue={filters.status ?? "all"}>
            <SelectTrigger className={styles.typeSelect} aria-label="Stato preventivo">
              <SlidersHorizontal aria-hidden="true" /><SelectValue placeholder="Tutti gli stati" />
            </SelectTrigger>
            <SelectContent>
              {QUOTE_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Filtra</Button>
          {hasFilters && (
            <Button variant="ghost" render={<Link href={`/${slug}/quotes`} />}>Azzera filtri</Button>
          )}
        </form>
        <Button variant="outline" render={<Link href={`/${slug}/quotes/import`} />}>
          <Upload data-icon="inline-start" /> Importa / Esporta
        </Button>
      </div>

      <section className={styles.tableCard} aria-label="Elenco preventivi">
        <div className={styles.tableHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Tutti i preventivi</h2>
            <p className={styles.sectionMeta}>{items.length} risultati in questa pagina</p>
          </div>
          <span className={styles.liveDot}><span /> Sincronizzato</span>
        </div>
        {items.length ? (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th className="text-left font-mono text-xs">Numero</th>
                  <th className="text-left">Titolo / Oggetto</th>
                  <th className="text-left">Cliente</th>
                  <th className="text-right font-semibold">Importo</th>
                  <th className="text-center">Validità</th>
                  <th className="text-left">Stato</th>
                  <th className="text-center">Aggiornato</th>
                  <th className={styles.actionsHead}>
                    <span className="sr-only">Azioni</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((quote) => {
                  const cfg = STATUS_CONFIG[quote.status ?? "DRAFT"];
                  return (
                    <tr key={quote.id} className={`transition-colors duration-200 ${cfg.bg} hover:bg-muted/60`}>
                      <td className="text-left font-mono text-xs">
                        <span className="font-medium">{quote.number}</span>
                      </td>
                      <td className="text-left">
                        <span className="font-medium">{quote.title ?? "—"}</span>
                      </td>
                      <td className="text-left">
                        <div>
                          <span>{quote.client?.display_name ?? "—"}</span>
                          {quote.client?.email && (
                            <span className="text-xs text-muted-foreground block mt-0.5">
                              {quote.client.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-right font-medium">
                        {formatCurrency(quote.total)}
                      </td>
                      <td className="text-center text-xs">
                        {quote.valid_until ? (
                          <time>{new Date(quote.valid_until).toLocaleDateString("it-IT")}</time>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="text-left">
                        <Badge variant={cfg.variant} size="sm">
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="text-center text-xs">
                        <time>{new Date(quote.updated_at ?? quote.created_at).toLocaleDateString("it-IT")}</time>
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            aria-label={`Anteprima preventivo ${quote.number}`}
                            title="Anteprima / PDF"
                          >
                            <Link href={`/${slug}/quotes/${quote.id}/pdf`}>
                              <FileText data-icon="inline-start" />
                            </Link>
                          </Button>
                          <QuoteActionsCell
                            slug={slug}
                            quoteId={quote.id}
                            quoteNumber={quote.number}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <h2>{hasFilters ? "Nessun preventivo trovato" : "Nessun preventivo"}</h2>
            <p>
              {hasFilters
                ? "Prova a modificare o azzerare i filtri."
                : "Non hai ancora creato preventivi. Inizia dal primo."}
            </p>
            <div>
              {hasFilters ? (
                <Button variant="outline" render={<Link href={`/${slug}/quotes`} />}>
                  Azzera filtri
                </Button>
              ) : (
                <Button render={<Link href={`/${slug}/quotes/create`} />}>
                  <Plus data-icon="inline-start" /> Nuovo preventivo
                </Button>
              )}
            </div>
          </div>
        )}
        {lastPage > 1 && (
          <nav className={styles.pagination} aria-label="Paginazione preventivi">
            {currentPage > 1 ? (
              <Button
                variant="outline"
                size="sm"
                render={
                  <Link
                    href={`/${slug}/quotes?q=${filters.q ?? ""}&stato=${filters.status ?? "all"}&page=${
                      currentPage - 1
                    }`}
                  />
                }
              >
                Precedente
              </Button>
            ) : (
              <span />
            )}
            <span>
              Pagina <strong>{currentPage}</strong> di {lastPage}
            </span>
            {currentPage < lastPage ? (
              <Button
                variant="outline"
                size="sm"
                render={
                  <Link
                    href={`/${slug}/quotes?q=${filters.q ?? ""}&stato=${filters.status ?? "all"}&page=${
                      currentPage + 1
                    }`}
                  />
                }
              >
                Successivo
              </Button>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
