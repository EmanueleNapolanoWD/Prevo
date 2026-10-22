"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import InfoClient from "./InfoClient/InfoClient";
import QuoteItems from "./QuoteItems/QuoteItems";
import TaxQuoteSettings from "@/components/app/DashboardComponents/Quotes/QuoteForm/Tax/TaxQuoteSetting";
import { QuoteHeader } from "./QuoteHeader/QuoteHeader";
import QuoteTemplate from "./QuoteTemplate/QuoteTemplate";
import { useQuoteForm } from "./hooks/useQuoteForm";
import styles from "./quote-form.module.css";

export default function QuoteForm() {
  const { slug } = useParams<{ slug: string }>();

  const {
    settings,
    settingsLoading,
    settingsError,
    currency,
    money,
    header,
    tax,
    appearance,
    items,
    totals,
    setHeader,
    setTax,
    setAppearance,
    setItems,
    clients,
    clientsLoading,
    clientError,
    setClientQuery,
    selectedClient,
    setSelectedClient,
    selectedEmailId,
    selectedPhoneId,
    selectedAddressId,
    setSelectedEmailId,
    setSelectedPhoneId,
    setSelectedAddressId,
    submit,
  } = useQuoteForm({ slug });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    const res = await submit();
    if (!res.ok) setSubmitError(res.error ?? "Errore durante il salvataggio");
    setSubmitting(false);
  }

  return (
    <div className={styles.form}>
      {/* aspetto template preventivo */}
      <section className={styles.section}>
        <QuoteTemplate values={appearance} onChange={setAppearance} />
      </section>

      {/* info cliente */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Cliente</h3>
        <InfoClient
          clients={clients}
          isLoading={clientsLoading}
          error={clientError}
          onQueryChange={setClientQuery}
          selectedClient={selectedClient}
          onSelectClient={setSelectedClient}
          selectedEmailId={selectedEmailId}
          selectedPhoneId={selectedPhoneId}
          selectedAddressId={selectedAddressId}
          onEmailChange={setSelectedEmailId}
          onPhoneChange={setSelectedPhoneId}
          onAddressChange={setSelectedAddressId}
        />
      </section>

      {/* dati preventivo */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Dati preventivo</h3>
        <QuoteHeader
          values={header}
          onChange={setHeader}
          disabled={settingsLoading}
        />
      </section>

      {/* voci preventivo */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Voci</h3>
        <QuoteItems
          items={items}
          onItemsChange={setItems}
          currency={currency}
        />
      </section>

      {/* tasse, note e termini */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Tasse, note e termini</h3>
        {settingsError && (
          <p role="alert" className={styles.error}>
            {settingsError}
          </p>
        )}
        <TaxQuoteSettings
          values={tax}
          onChange={setTax}
          defaultNotes={settings?.default_notes}
          defaultTerms={settings?.default_terms}
          disabled={settingsLoading}
        />
      </section>

      {/* riepilogo */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Riepilogo</h3>
        {totals ? (
          <dl className={styles.summary}>
            <div className={styles.summaryRow}>
              <dt>Subtotale</dt>
              <dd>{money.format(totals.subtotal)}</dd>
            </div>
            <div className={styles.summaryRow}>
              <dt>Sovrapprezzo</dt>
              <dd>{money.format(totals.surcharge)}</dd>
            </div>
            <div className={styles.summaryRow}>
              <dt>Imponibile</dt>
              <dd>{money.format(totals.taxable)}</dd>
            </div>
            <div className={styles.summaryRow}>
              <dt>IVA</dt>
              <dd>{money.format(totals.vat)}</dd>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <dt>Totale</dt>
              <dd>{money.format(totals.total)}</dd>
            </div>
          </dl>
        ) : (
          <p className={styles.muted}>Aggiungi almeno una voce per vedere i totali.</p>
        )}
      </section>

      <div className={styles.footer}>
        {submitError && (
          <p role="alert" className={styles.error}>
            {submitError}
          </p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || settingsLoading}
          className={styles.submit}
        >
          {submitting ? "Salvataggio…" : "Salva preventivo"}
        </button>
      </div>
    </div>
  );
}