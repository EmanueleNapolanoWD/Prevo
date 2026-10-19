'use client';

import { useTransition } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  clientFormDefaults,
  clientFormSchema,
  keptRowIndexes,
  toClientPayload,
  type ClientFormValues,
  type ClientPayload,
} from '@/lib/Api/Clients/clients.schema';

/** Risultato che la server action deve restituire (errors = errori 422 di Laravel). */
export type ClientActionResult =
  | { ok: true }
  | { ok: false; message?: string; errors?: Record<string, string[]> };

type Options = {
  /** Valori iniziali: in update passa toFormValues(client). */
  defaultValues?: Partial<ClientFormValues>;
  /** Server action di create o update. */
  onSubmit: (payload: ClientPayload) => Promise<ClientActionResult>;
  onSuccess?: () => void;
};

export function useClientForm({ defaultValues, onSubmit, onSuccess }: Options) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: { ...clientFormDefaults, ...defaultValues },
    mode: 'onTouched',
  });

  const submit = form.handleSubmit((values) => {
    form.clearErrors('root.server');

    // Le righe vuote non vengono inviate: gli indici di Laravel vanno riportati a quelli del form
    const kept = keptRowIndexes(values);
    const toFormPath = (path: string) => {
      const match = path.match(/^(emails|phones|addresses)\.(\d+)(.*)$/);
      if (!match) return path;
      const [, list, index, rest] = match;
      return `${list}.${kept[list as keyof typeof kept][Number(index)] ?? index}${rest}`;
    };

    startTransition(async () => {
      const result = await onSubmit(toClientPayload(values));

      if (result.ok) {
        onSuccess?.();
        return;
      }

      Object.entries(result.errors ?? {}).forEach(([path, messages]) => {
        form.setError(toFormPath(path) as FieldPath<ClientFormValues>, {
          type: 'server',
          message: messages[0],
        });
      });

      form.setError('root.server', {
        type: 'server',
        message: result.message ?? 'Salvataggio non riuscito. Controlla i campi evidenziati.',
      });
    });
  });

  return {
    form,
    submit,
    isPending,
    serverError: form.formState.errors.root?.server?.message,
  };
}