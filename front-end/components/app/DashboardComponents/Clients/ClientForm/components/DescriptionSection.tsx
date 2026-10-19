'use client';

import { Section, TextareaField } from './Fields';

export function DescriptionSection() {
  return (
    <Section title="Descrizione">
      <TextareaField name="note" label="Descrizione" placeholder="Descrizione" />
    </Section>
  );
}