'use client';

import { FileText } from 'lucide-react';
import { COUNTRIES, VAT_RATES } from '@/lib/Utility/Clients/clients.schema';
import { FieldGrid, SelectField, Section, SwitchField, TextField } from './Fields';

export function TaxSection() {
  return (
    <Section
      step={5}
      eyebrow="Fiscale"
      icon={FileText}
      title="Dati fiscali"
      description="Dati necessari per documenti e fatturazione elettronica."
    >
      <FieldGrid>
        <SelectField
          name="country_code"
          label="Nazione fiscale"
          options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
        />
        <SelectField name="default_vat_rate" label="Aliquota fiscale" options={VAT_RATES} />
        <TextField name="vat_number" label="Partita IVA" placeholder="Partita IVA" inputMode="numeric" />
        <TextField name="tax_code" label="Codice fiscale" placeholder="Codice fiscale" maxLength={16} uppercase />
        <TextField name="pec" label="PEC" placeholder="nome@pec.it" type="email" />
        <TextField name="sdi_code" label="Codice destinatario" placeholder="0000000" maxLength={7} uppercase />
      </FieldGrid>

      <SwitchField name="is_public_administration" label="Pubblica amministrazione" />
    </Section>
  );
}