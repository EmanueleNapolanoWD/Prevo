'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { CLIENT_TYPES, SALUTATIONS, type ClientFormValues } from '@/lib/Api/Clients/clients.schema';
import { ROW, SelectField, Section, TextField } from './Fields';
import { RepeatableInputs } from './RepeatableInputs';

export type ClientGroup = { id: string; name: string };

export function GeneralSection({ groups }: { groups: ClientGroup[] }) {
  const { control } = useFormContext<ClientFormValues>();
  const type = useWatch({ control, name: 'type' });

  return (
    <Section title="Generale">
      <SelectField name="type" label="Tipo" options={CLIENT_TYPES} />

      {type === 'PERSON' ? (
        <>
          <TextField name="name" label="Nome" placeholder="Nome" autoComplete="off" />
          <TextField name="surname" label="Cognome" placeholder="Cognome" autoComplete="off" />
          <SelectField
            name="salutation"
            label="Saluto"
            placeholder="Saluto"
            clearLabel="Nessun saluto"
            options={SALUTATIONS.map((s) => ({ value: s, label: s }))}
          />
        </>
      ) : (
        <TextField name="company_name" label="Nome azienda" placeholder="Nome azienda" autoComplete="off" />
      )}

      <RepeatableInputs name="emails" valueKey="email" label="E-mail" placeholder="E-mail" addLabel="Aggiungi e-mail" inputType="email" />
      <RepeatableInputs name="phones" valueKey="phone" label="Telefono" placeholder="Telefono" addLabel="Aggiungi telefono" inputType="tel" />

      <TextField name="website" label="Sito web" placeholder="https://" type="url" />

      {groups.length > 0 && (
        <Controller
          control={control}
          name="group_ids"
          render={({ field }) => (
            <div className={ROW}>
              <span className="pt-1 text-sm">Gruppi</span>
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                {groups.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={field.value.includes(g.id)}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? [...field.value, g.id] : field.value.filter((id) => id !== g.id))
                      }
                    />
                    {g.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        />
      )}
    </Section>
  );
}