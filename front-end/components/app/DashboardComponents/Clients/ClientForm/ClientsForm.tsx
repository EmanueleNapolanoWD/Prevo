'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormProvider } from 'react-hook-form';
import { AddressesSection } from './components/AddressesSection';
import { DescriptionSection } from './components/DescriptionSection';
import { GeneralSection, type ClientGroup } from './components/GeneralSection';
import { PaymentSection } from './components/PaymentSection';
import { TaxSection } from './components/TaxSection';
import type { ClientFormValues, ClientPayload } from '@/lib/Api/Clients/clients.schema';
import { useClientForm, type ClientActionResult } from './hooks/useClientForm';

type Props = {
  mode: 'create' | 'update';
  /** In update: toFormValues(client). Passa anche key={client.id} per reinizializzare il form. */
  defaultValues?: Partial<ClientFormValues>;
  groups?: ClientGroup[];
  onSubmit: (payload: ClientPayload) => Promise<ClientActionResult>;
  onSuccess?: () => void;
};

export default function ClientForm({ mode, defaultValues, groups = [], onSubmit, onSuccess }: Props) {
  const { form, submit, isPending, serverError } = useClientForm({ defaultValues, onSubmit, onSuccess });
  const isCreate = mode === 'create';

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="space-y-3">
        <header className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{isCreate ? 'Nuovo contatto' : 'Modifica contatto'}</h1>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {isCreate ? 'Crea contatto' : 'Salva modifiche'}
          </Button>
        </header>

        {serverError && (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </p>
        )}

        <div className="rounded-lg border bg-card px-4">
          <GeneralSection groups={groups} />
          <DescriptionSection />
          <AddressesSection />
          <PaymentSection />
          <TaxSection />
        </div>
      </form>
    </FormProvider>
  );
}