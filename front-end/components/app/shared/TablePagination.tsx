"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

type TablePaginationProps = {
  currentPage: number;
  lastPage: number;
  totalItems: number;
  pageItems: number;
  buildHref: (page: number) => string;
  className?: string;
};

export function TablePagination({
  currentPage,
  lastPage,
  totalItems,
  pageItems,
  buildHref,
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(lastPage, 1);
  const start = (currentPage - 1) * pageItems + 1;
  const end = Math.min(currentPage * pageItems, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-t border-border pt-3 text-sm",
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        Visualizzati{" "}
        <span className="font-medium text-foreground">
          {start} – {end}
        </span>{" "}
        di <span className="font-medium text-foreground">{totalItems}</span>{" "}
        elementi
      </div>
      <nav aria-label="Paginazione" className="flex items-center gap-2 shrink-0">
        {currentPage > 1 ? (
          <Link
            href={buildHref(currentPage - 1)}
            rel="prev"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
              "data-[slot=button]"
            )}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Precedente
          </Link>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-muted-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Precedente
          </Button>
        )}
        <span className="px-2 font-medium text-foreground">
          Pagina {currentPage} di {totalPages}
        </span>
        {currentPage < totalPages ? (
          <Link
            href={buildHref(currentPage + 1)}
            rel="next"
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
              "data-[slot=button]"
            )}
          >
            Successiva
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled className="text-muted-foreground">
            Successiva
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        )}
      </nav>
    </div>
  );
}