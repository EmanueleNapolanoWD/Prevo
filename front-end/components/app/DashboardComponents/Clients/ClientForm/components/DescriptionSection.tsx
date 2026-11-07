'use client';

import { AlignLeft } from 'lucide-react';
import { Section, TextareaField } from './Fields';

export function DescriptionSection() {
  return (
    <Section
      step={2}
      eyebrow="Note"
      icon={AlignLeft}
      title="Descrizione"
      description="Appunti e informazioni utili su questo contatto."
    >
      <TextareaField name="note" label="Descrizione" placeholder="Descrizione" />
    </Section>
  );
}