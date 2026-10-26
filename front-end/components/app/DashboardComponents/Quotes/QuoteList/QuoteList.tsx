"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Quote } from "@/types/quote";
import QuoteRow from "./QuoteRow";
import { QuoteStatus } from "@/types/quote";

const ALL_STATUSES = "ALL";

type QuotesListProps = {
  initialQuotes: Quote[];
  slug: string;
  currentPage: number;
  lastPage: number;
};

type QuoteStatusConfig = {
  label: string;
  className: string;
};

/**
 * Unica fonte di verità per etichette e stili degli stati.
 * Usata sia dal badge in QuoteRow sia dal filtro in QuotesList.
 */
export const QUOTE_STATUS: Record<QuoteStatus, QuoteStatusConfig> = {
  DRAFT: {
    label: "Bozza",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  SENT: {
    label: "Inviato",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  VIEWED: {
    label: "Inviato",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  ACCEPTED: {
    label: "Accettato",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "Rifiutato",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  EXPIRED: {
    label: "Scaduto",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
};

const STATUS_OPTIONS = [
  { value: ALL_STATUSES, label: "Tutti gli stati" },
  ...Object.entries(QUOTE_STATUS).map(([value, { label }]) => ({
    value,
    label,
  })),
];

export function QuotesList({
  initialQuotes,
  slug,
  currentPage,
  lastPage,
}: QuotesListProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(ALL_STATUSES);
  // Invece di copiare le props in uno state e risincronizzarle con un effect,
  // teniamo solo gli id eliminati e li escludiamo dai dati arrivati dal server.
  const [removedIds, setRemovedIds] = useState<ReadonlySet<string>>(new Set());

  const totalPages = Math.max(lastPage, 1);
  const normalizedQuery = query.trim().toLowerCase();
  const hasFilters = normalizedQuery !== "" || status !== ALL_STATUSES;

  const visibleQuotes = useMemo(
    () => initialQuotes.filter((quote) => !removedIds.has(quote.id)),
    [initialQuotes, removedIds],
  );

  const filteredQuotes = useMemo(
    () =>
      visibleQuotes.filter((quote) => {
        const matchesStatus =
          status === ALL_STATUSES || quote.status === status;

        if (!matchesStatus) return false;
        if (!normalizedQuery) return true;

        return [
          quote.number,
          quote.title,
          quote.client?.name,
          quote.contact.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    [visibleQuotes, normalizedQuery, status],
  );

  function resetFilters() {
    setQuery("");
    setStatus(ALL_STATUSES);
  }

  // Chiamata da QuoteRow solo dopo una cancellazione riuscita sul server
  function removeQuote(id: string) {
    setRemovedIds((current) => new Set(current).add(id));
    router.refresh(); // riallinea totale e paginazione con il backend
  }

  const pageHref = (page: number) => `/${slug}/quotes?page=${page}`;

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-b bg-background p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              aria-label="Cerca preventivi"
              placeholder="Cerca per titolo, cliente o numero..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              className="w-full sm:w-44"
              aria-label="Filtra per stato"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="self-start sm:self-auto"
            >
              <X aria-hidden="true" />
              Azzera filtri
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-32">Numero</TableHead>
                <TableHead>Preventivo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Importo</TableHead>
                <TableHead>Aggiornato</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="w-24">
                  <span className="sr-only">Azioni</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <QuoteRow
                  key={quote.id}
                  quote={quote}
                  slug={slug}
                  onDelete={removeQuote}
                />
              ))}

              {filteredQuotes.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {visibleQuotes.length === 0
                      ? "Non ci sono ancora preventivi."
                      : "Nessun preventivo corrisponde ai filtri."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t bg-background px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span aria-live="polite">
            Visualizzati {filteredQuotes.length} di {visibleQuotes.length}{" "}
            preventivi in questa pagina
          </span>

          <nav aria-label="Paginazione" className="flex items-center gap-2">
            {currentPage > 1 ? (
              <Link
                href={pageHref(currentPage - 1)}
                rel="prev"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <ChevronLeft data-icon="inline-start" />
                Precedente
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft data-icon="inline-start" />
                Precedente
              </Button>
            )}

            <span className="px-2 font-medium text-foreground">
              Pagina {currentPage} di {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={pageHref(currentPage + 1)}
                rel="next"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Successiva
                <ChevronRight data-icon="inline-end" />
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Successiva
                <ChevronRight data-icon="inline-end" />
              </Button>
            )}
          </nav>
        </div>
      </CardContent>
    </Card>
  );
}
