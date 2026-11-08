"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuoteActionsCellProps {
  slug: string;
  quoteId: string;
  quoteNumber: string;
}

export function QuoteActionsCell({ slug, quoteId, quoteNumber }: QuoteActionsCellProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Modifica preventivo ${quoteNumber}`}
        title="Modifica"
        render={<Link href={`/${slug}/quotes/${quoteId}/edit`} />}
      >
        <Pencil data-icon="inline-start" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Elimina preventivo ${quoteNumber}`}
        title="Elimina"
        onClick={() => {
          if (window.confirm(`Eliminare il preventivo ${quoteNumber}?`)) {
            console.log("Elimina preventivo:", quoteId);
          }
        }}
      >
        <Trash2 data-icon="inline-start" />
      </Button>
    </div>
  );
}