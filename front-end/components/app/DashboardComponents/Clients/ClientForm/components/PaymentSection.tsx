'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { ClientFormValues } from '@/lib/Utility/Clients/clients.schema';
import { Section, TextField, Toggle } from './Fields';

export function PaymentSection() {
  const { getValues, setValue } = useFormContext<ClientFormValues>();
  // Attivo di partenza se il contatto ha già dei termini salvati (update)
  const [enabled, setEnabled] = useState(() => Boolean(getValues('payment_terms')));

  return (
    <Section
      step={4}
      eyebrow="Pagamento"
      icon={Wallet}
      title="Termini di pagamento e sconto"
      description="Condizioni predefinite per questo contatto."
    >
      <Toggle
        label="Termini di pagamento"
        checked={enabled}
        onChange={(e) => {
          const checked = e.target.checked;
          setEnabled(checked);
          if (!checked) setValue('payment_terms', '', { shouldDirty: true });
        }}
      />

      {enabled && <TextField name="payment_terms" label="Termini" placeholder="Es. 30 giorni data fattura" />}
    </Section>
  );
}