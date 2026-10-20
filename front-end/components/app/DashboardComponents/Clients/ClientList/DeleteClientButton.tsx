"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { deleteClient } from "@/lib/Api/Clients/clients.actions";

interface Props {
  slug: string;
  clientId: string;
  clientName: string;
}

export function DeleteClientButton({ slug, clientId, clientName }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteClient(slug, clientId);
      if (result.ok) {
        setOpen(false);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label={`Elimina ${clientName}`}
            title="Elimina"
          />
        }
      >
        <Trash2 />
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminare il contatto?</AlertDialogTitle>
          <AlertDialogDescription>
            Stai per eliminare <strong>{clientName}</strong>. L&apos;operazione
            rimuove il contatto dalla lista.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annulla</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault(); // non chiudere finché la richiesta non finisce
              handleDelete();
            }}
          >
            {isPending && <Loader2 className="animate-spin" />}
            Elimina
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}