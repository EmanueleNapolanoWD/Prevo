"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Edit3, FileText, Loader2, Trash2 } from "lucide-react";
import type { Quote } from "@/types/quote";
import { deleteQuoteAction } from "@/lib/Api/Quote/quote.action";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/app/shared/StatusBadge";
import styles from "./quote-row.module.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const currencyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function formatMoney(value?: number | string | null) {
  const n = Number(value);
  return Number.isFinite(n) ? currencyFormatter.format(n) : "—";
}

type QuoteRowProps = {
  quote: Quote;
  slug: string;
  onDelete: (id: string) => void;
};

export default function QuoteRow({ quote, slug, onDelete }: QuoteRowProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName =
    quote.client?.display_name ?? quote.contact.email ?? "Cliente non indicato";
  const clientContact = quote.contact.email ?? quote.contact.phone ?? null;
  const itemsCount = quote.items?.length ?? 0;
  const validUntil = formatDate(quote.valid_until);

  const pdfUrl = `/${slug}/quotes/${quote.id}/pdf`;

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      const res = await deleteQuoteAction(slug, quote.id);

      if (!res.ok) {
        setError(res.message);
        return;
      }

      onDelete(quote.id);
    } catch {
      setError("Impossibile eliminare il preventivo. Riprova.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <TableRow
      aria-busy={deleting}
      className={deleting ? "opacity-60" : undefined}
    >
      {/* Numero */}
      <TableCell className="font-mono text-xs text-muted-foreground">
        {quote.number}
      </TableCell>

      {/* Preventivo */}
      <TableCell>
        <div className="flex flex-col">
          <Link
            href={`/${slug}/quotes/${quote.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {quote.title}
          </Link>
          <span className="text-xs text-muted-foreground">
            {clientName}
          </span>
        </div>
      </TableCell>

      {/* Cliente */}
      <TableCell className="text-sm">
        <span className="text-muted-foreground">
          {clientContact ?? "—"}
        </span>
      </TableCell>

      {/* Importo */}
      <TableCell className="text-right font-medium tabular-nums">
        {formatMoney(quote.total)}
      </TableCell>

      {/* Aggiornato */}
      <TableCell className="text-sm">
        <div className="flex flex-col">
          <span className="text-muted-foreground">
            {formatDate(quote.updated_at)}
          </span>
          {validUntil && (
            <span className="text-xs text-muted-foreground">
              Valido fino al {validUntil}
            </span>
          )}
        </div>
      </TableCell>

      {/* Stato */}
      <TableCell>
        <StatusBadge status={quote.status} dot />
      </TableCell>

      {/* Azioni */}
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            render={
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visualizza PDF del preventivo ${quote.number}`}
              >
                <FileText aria-hidden="true" />
              </a>
            }
          />

          <Button
            variant="ghost"
            size="icon"
            render={
              <a
                href={`${pdfUrl}?download=1`}
                aria-label={`Scarica PDF del preventivo ${quote.number}`}
              >
                <Download aria-hidden="true" />
              </a>
            }
          />

          <Link
            href={`/${slug}/quotes/${quote.id}/edit`}
            aria-label={`Modifica preventivo ${quote.number}`}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <Edit3 aria-hidden="true" />
          </Link>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={deleting}
                  aria-label={`Elimina preventivo ${quote.number}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  {deleting ? (
                    <Loader2 aria-hidden="true" className="animate-spin" />
                  ) : (
                    <Trash2 aria-hidden="true" />
                  )}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Eliminare il preventivo {quote.number}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  L'operazione non può essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Elimina
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {error && (
          <p role="alert" className="mt-1 text-right text-xs text-destructive">
            {error}
          </p>
        )}
      </TableCell>
    </TableRow>
  );
}
