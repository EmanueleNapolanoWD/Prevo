'use client';

import { MapPin, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { ADDRESS_TYPES, COUNTRIES } from '@/lib/Utility/Clients/clients.schema';
import { FieldGrid, SelectField, Section, TextField } from './Fields';
import styles from '../clients-form.module.css';

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
    <Section
      step={3}
      eyebrow="Sede"
      icon={MapPin}
      title="Indirizzi"
      description="Indirizzi di fatturazione, spedizione e cantiere."
    >
      {fields.map((row, i) => {
        const p = `addresses.${i}`;

        return (
          <div key={row.fieldKey} className={styles.subCard}>
            <div className={styles.subCardHeader}>
              <div className={styles.subCardMain}>
                <SelectField name={`${p}.type`} label="Tipologia" options={ADDRESS_TYPES} />
              </div>

              {fields.length > 1 && (
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="Rimuovi indirizzo"
                  onClick={() => remove(i)}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              )}
            </div>

            <FieldGrid>
              <TextField name={`${p}.street`} label="Via" placeholder="Via" />
              <TextField name={`${p}.street_number`} label="N. civico" placeholder="N. civico" />
            </FieldGrid>

            <TextField name={`${p}.extra`} label="Supplementare" placeholder="Scala, interno..." />

            <FieldGrid columns={3}>
              <TextField
                name={`${p}.postal_code`}
                label="Codice postale"
                placeholder="Codice postale"
                inputMode="numeric"
                maxLength={10}
              />
              <TextField name={`${p}.city`} label="Città" placeholder="Città" />
              <TextField name={`${p}.province`} label="Provincia" placeholder="Es. NA" maxLength={2} uppercase />
            </FieldGrid>

            <FieldGrid>
              <SelectField
                name={`${p}.country_code`}
                label="Paese"
                options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
              />
            </FieldGrid>
          </div>
        );
      })}

      <button type="button" className={styles.addButton} onClick={() => append(emptyAddress('SHIPPING'))}>
        <Plus aria-hidden="true" />
        Aggiungi indirizzo
      </button>
    </Section>
  );
}