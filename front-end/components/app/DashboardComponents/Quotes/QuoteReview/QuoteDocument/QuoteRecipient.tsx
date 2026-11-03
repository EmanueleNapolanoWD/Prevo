'use client'

import type { ClientDetail } from "@/types/client";

import { QuoteSectionTitle } from "./QuoteSectionTitle";
import styles from "./QuoteRecipient.module.css";

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("it-IT");
}

interface QuoteRecipientProps {
  selectedClient: ClientDetail | null;
  address: string | null | undefined;
  email: string | null | undefined;
  phone: string | null | undefined;
  validUntil: string | null | undefined;
}

/** Destinatario (con referente) e data di validità. */
export function QuoteRecipient({
  selectedClient,
  address,
  email,
  phone,
  validUntil,
}: QuoteRecipientProps) {
  return (
    <section className={styles.metaGrid}>
      <div className={styles.clientSection}>
        <QuoteSectionTitle>Destinatario</QuoteSectionTitle>
        <strong className={!selectedClient ? styles.muted : undefined}>
          {selectedClient?.display_name ?? "Seleziona un cliente"}
        </strong>
        {address && <p>{address}</p>}
        {email && <p>{email}</p>}
        {phone && <p>{phone}</p>}
      </div>

      {validUntil && (
        <div className={styles.validity}>
          <QuoteSectionTitle>Valido fino al</QuoteSectionTitle>
          <strong>{formatDate(validUntil)}</strong>
        </div>
      )}
    </section>
  );
}
