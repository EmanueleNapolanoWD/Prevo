"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit3, Loader2, Trash2 } from "lucide-react";
import type { Quote } from "@/types/quote";
import { deleteQuoteAction } from "@/lib/Api/Quote/quote.action";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import type { QuoteStatus } from "@/types/quote";

const QUOTE_STATUS: Record<QuoteStatus, { label: string; className: string }> =
  {
    DRAFT: {
      label: "Bozza",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    SENT: {
      label: "Inviato",
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    VIEWED: {
      label: "Visualizzato",
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

const currencyFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

type QuoteRowProps = {
  quote: Quote;
  slug: string;
  onDelete: (id: string) => void;
};

export default function QuoteRow({ quote, slug, onDelete }: QuoteRowProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = QUOTE_STATUS[quote.status];

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      const res = await deleteQuoteAction(slug, quote.id);

      if (!res.ok) {
        setError(res.message); // la riga resta visibile
        return;
      }

      onDelete(quote.id); // solo a successo
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
      <TableCell className="font-mono text-xs text-muted-foreground">
        {quote.number}
      </TableCell>

      <TableCell className="min-w-56 font-medium">{quote.title}</TableCell>

      <TableCell>
        <div className="flex flex-col">
          {quote.contact.email && (
            <span className="font-medium">{quote.contact.email}</span>
          )}
          <span className="text-sm text-muted-foreground">
            {quote.contact.email}
          </span>
        </div>
      </TableCell>

      <TableCell className="font-medium">
        {currencyFormatter.format(quote.total)}
      </TableCell>

      <TableCell className="whitespace-nowrap text-muted-foreground">
        {formatDate(quote.updated_at)}
      </TableCell>

      <TableCell>
        <Badge variant="outline" className={status?.className}>
          {status?.label ?? quote.status}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/${slug}/quotes/${quote.id}/edit`}
            aria-label={`Modifica preventivo ${quote.number}`}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <Edit3 aria-hidden="true" />
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
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
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Eliminare il preventivo {quote.number}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  L&apos;operazione non può essere annullata.
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
