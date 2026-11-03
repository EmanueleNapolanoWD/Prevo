"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Quote } from "@/types/quote";
import { QuoteStatus } from "@/types/quote";
import QuoteRow from "./QuoteRow";
import { getQuoteStatus } from "@/components/app/shared/quote-status";
import { ListToolbar } from "@/components/app/shared/ListToolbar";
import { DataCard } from "@/components/app/shared/DataCard";
import { TablePagination } from "@/components/app/shared/TablePagination";
import { PageHeader } from "@/components/app/shared/PageHeader";

const ALL_STATUSES = "ALL";

type QuotesListProps = {
  initialQuotes: Quote[];
  slug: string;
  currentPage: number;
  lastPage: number;
};

const QUOTE_STATUS_VALUES: QuoteStatus[] = [
  "DRAFT",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
];

const STATUS_OPTIONS = [
  { value: ALL_STATUSES, label: "Tutti gli stati" },
  ...QUOTE_STATUS_VALUES.map((value) => {
    const config = getQuoteStatus(value);
    return { value, label: config.label };
  }),
];

export function QuotesList({
  initialQuotes,
  slug,
  currentPage,
  lastPage,
}: QuotesListProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(ALL_STATUSES);
  const [removedIds, setRemovedIds] = useState<ReadonlySet<string>>(new Set());

  const totalPages = Math.max(lastPage, 1);
  const normalizedQuery = query.trim().toLowerCase();
  const hasFilters = normalizedQuery !== "" || status !== ALL_STATUSES;

  const visibleQuotes = useMemo(
    () => initialQuotes.filter((quote) => !removedIds.has(quote.id)),
    [initialQuotes, removedIds]
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
          quote.client?.display_name,
          quote.contact?.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    [visibleQuotes, normalizedQuery, status]
  );

  function resetFilters() {
    setQuery("");
    setStatus(ALL_STATUSES);
  }

  function removeQuote(id: string) {
    setRemovedIds((prev) => new Set([...prev, id]));
  }

  function pageHref(page: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (status !== ALL_STATUSES) params.set("status", status);
    if (page > 1) params.set("page", String(page));
    const queryString = params.toString();
    return `/${slug}/quotes${queryString ? `?${queryString}` : ""}`;
  }

  return (
    <>
      <PageHeader
        title="Preventivi"
        description="Gestisci e monitora tutti i tuoi preventivi in un unico posto."
        actions={
          <Link
            href={`/${slug}/quotes/create`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
          >
            <span>Nuovo preventivo</span>
          </Link>
        }
      />
      <DataCard>
        <ListToolbar
          placeholder="Cerca preventivi…"
          q={query}
          onQueryChange={setQuery}
          filterLabel="Stato"
          filterValue={status}
          filterOptions={STATUS_OPTIONS}
          onFilterChange={setStatus}
        />
        {hasFilters && (
          <div className="flex items-start gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-xs"
            >
              <X aria-hidden="true" className="size-4 mr-1" />
              Azzera filtri
            </Button>
          </div>
        )}
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
        <TablePagination
          currentPage={currentPage}
          lastPage={lastPage}
          totalItems={visibleQuotes.length}
          pageItems={filteredQuotes.length}
          buildHref={pageHref}
        />
      </DataCard>
    </>
  );
}
