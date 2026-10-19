'use client';

import { CirclePlus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ADDRESS_TYPES, COUNTRIES } from '@/lib/Api/Clients/clients.schema';
import { SelectField, Section, TextField } from './Fields';

const emptyAddress = (type: 'BILLING' | 'SHIPPING' | 'SITE') => ({
  type,
  street: '',
  street_number: '',
  extra: '',
  postal_code: '',
  city: '',
  province: '',
  country_code: 'IT',
});

export function AddressesSection() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'addresses', keyName: 'fieldKey' });

  return (
    <Section title="Indirizzo">
      {fields.map((row, i) => {
        const p = `addresses.${i}`;

        return (
          <div key={row.fieldKey} className="space-y-2.5">
            {i > 0 && <Separator className="my-4" />}

            <SelectField name={`${p}.type`} label="Tipologia" options={ADDRESS_TYPES} />
            <TextField name={`${p}.street`} label="Via" placeholder="Via" />
            <TextField name={`${p}.street_number`} label="N. civico" placeholder="N. civico" />
            <TextField name={`${p}.extra`} label="Supplementare" placeholder="Supplementare" />
            <TextField name={`${p}.postal_code`} label="Codice postale" placeholder="Codice postale" inputMode="numeric" maxLength={10} />
            <TextField name={`${p}.city`} label="Città" placeholder="Città" />
            <TextField name={`${p}.province`} label="Provincia" placeholder="Es. NA" maxLength={2} className="uppercase" />
            <SelectField
              name={`${p}.country_code`}
              label="Paese"
              options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
            />

            {fields.length > 1 && (
              <div className="sm:pl-[151px]">
                <Button type="button" variant="link" size="sm" className="h-auto p-0 text-muted-foreground" onClick={() => remove(i)}>
                  Rimuovi indirizzo
                </Button>
              </div>
            )}
          </div>
        );
      })}

      <div className="sm:pl-[151px]">
        <Button type="button" variant="ghost" size="sm" className="font-semibold" onClick={() => append(emptyAddress('SHIPPING'))}>
          <CirclePlus />
          Aggiungi indirizzo
        </Button>
      </div>
    </Section>
  );
}