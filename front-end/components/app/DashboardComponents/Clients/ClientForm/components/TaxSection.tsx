'use client';

import { COUNTRIES, VAT_RATES } from '@/lib/Api/Clients/clients.schema';
import { SelectField, Section, SwitchField, TextField } from './Fields';

export function TaxSection() {
  return (
    <Section title="Tasse" hint="Dati fiscali per la fatturazione elettronica">
      <SelectField
        name="country_code"
        label="Nazione fiscale"
        options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
      />
      <SelectField name="default_vat_rate" label="Aliquota fiscale" options={VAT_RATES} />
      <TextField name="vat_number" label="Partita IVA" placeholder="Partita IVA" inputMode="numeric" />
      <TextField name="tax_code" label="Codice Fiscale" maxLength={16} className="uppercase" />
      <TextField name="pec" label="PEC" type="email" />
      <TextField name="sdi_code" label="Codice Destinatario" maxLength={7} className="uppercase" />
      <SwitchField name="is_public_administration" label="Pubblica amministrazione" />
    </Section>
  );
}