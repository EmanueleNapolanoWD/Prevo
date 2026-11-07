'use client';

import { User } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { CLIENT_TYPES, SALUTATIONS, type ClientFormValues } from '@/lib/Utility/Clients/clients.schema';
import { FieldGrid, SelectField, Section, TextField } from './Fields';
import { RepeatableInputs } from './RepeatableInputs';
import styles from '../clients-form.module.css';

export type ClientGroup = { id: string; name: string };

export function GeneralSection({ groups }: { groups: ClientGroup[] }) {
  const { control } = useFormContext<ClientFormValues>();
  const type = useWatch({ control, name: 'type' });

  return (
    <Section
      step={1}
      eyebrow="Identità"
      icon={User}
      title="Anagrafica contatto"
      description="Le informazioni principali del contatto."
    >
      <FieldGrid>
        <SelectField name="type" label="Tipo" options={CLIENT_TYPES} />

        {type === 'PERSON' ? (
          <>
            <SelectField
              name="salutation"
              label="Saluto"
              placeholder="Saluto"
              clearLabel="Nessun saluto"
              options={SALUTATIONS.map((s) => ({ value: s, label: s }))}
            />
            <TextField name="name" label="Nome" placeholder="Nome" autoComplete="off" />
            <TextField name="surname" label="Cognome" placeholder="Cognome" autoComplete="off" />
          </>
        ) : (
          <TextField name="company_name" label="Nome azienda" placeholder="Nome azienda" autoComplete="off" />
        )}
      </FieldGrid>

      <RepeatableInputs
        name="emails"
        valueKey="email"
        label="E-mail"
        placeholder="E-mail"
        addLabel="Aggiungi e-mail"
        inputType="email"
      />
      <RepeatableInputs
        name="phones"
        valueKey="phone"
        label="Telefono"
        placeholder="Telefono"
        addLabel="Aggiungi telefono"
        inputType="tel"
      />

      <TextField name="website" label="Sito web" placeholder="https://" type="url" />

      {groups.length > 0 && (
        <Controller
          control={control}
          name="group_ids"
          render={({ field }) => {
            const selected: string[] = field.value ?? [];

            return (
              <div className={styles.field}>
                <span className={styles.label}>Gruppi</span>
                <div className={styles.chips}>
                  {groups.map((g) => (
                    <label key={g.id} className={styles.chip}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={selected.includes(g.id)}
                        onChange={(e) =>
                          field.onChange(
                            e.target.checked ? [...selected, g.id] : selected.filter((id) => id !== g.id),
                          )
                        }
                      />
                      {g.name}
                    </label>
                  ))}
                </div>
              </div>
            );
          }}
        />
      )}
    </Section>
  );
}