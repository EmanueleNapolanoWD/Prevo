'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { ClientFormValues } from '@/lib/Api/Clients/clients.schema';
import { Section, TextField } from './Fields';

export function PaymentSection() {
  const { getValues, setValue } = useFormContext<ClientFormValues>();
  // Attivo di partenza se il contatto ha già dei termini salvati (update)
  const [enabled, setEnabled] = useState(() => getValues('payment_terms') !== '');

  return (
    <Section title="Termini di pagamento e sconto" hint="Condizioni predefinite per questo contatto">
      <div className="flex items-center gap-2">
        <Switch
          id="payment-terms-switch"
          checked={enabled}
          onCheckedChange={(checked) => {
            setEnabled(checked);
            if (!checked) setValue('payment_terms', '', { shouldDirty: true });
          }}
        />
        <Label htmlFor="payment-terms-switch" className="font-semibold">
          Termini di pagamento
        </Label>
      </div>

      {enabled && <TextField name="payment_terms" label="Termini" placeholder="Es. 30 giorni data fattura" />}
    </Section>
  );
}