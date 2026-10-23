"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import InfoClient from "./InfoClient/InfoClient";
import QuoteItems from "./QuoteItems/QuoteItems";
import TaxQuoteSettings from "@/components/app/DashboardComponents/Quotes/QuoteForm/Tax/TaxQuoteSetting";
import { QuoteHeader } from "./QuoteHeader/QuoteHeader";
import QuoteTemplate from "./QuoteTemplate/QuoteTemplate";
import styles from "./quote-form.module.css";
import type { UseQuoteFormReturn } from "../hooks/useQuoteForm";
import { LoaderCircle, Save } from "lucide-react";

export default function QuoteForm({ form }: { form: UseQuoteFormReturn }) {
  const {
    settings,
    settingsLoading,
    settingsError,
    currency,
    header,
    tax,
    appearance,
    items,
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
    resetForm,
  } = form;

  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    const res = await submit();

    if (!res.ok) {
      setSubmitting(false);
      setSubmitError(res.error ?? "Errore durante il salvataggio");
      return;
    }

    resetForm();
    setSubmitting(false);
    router.refresh();
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
          {submitting ? (
            <>
              <LoaderCircle size={17} className={styles.spinner} />
              Salvataggio…
            </>
          ) : (
            <>
              <Save size={17} strokeWidth={2} />
              Salva preventivo
            </>
          )}
        </button>
      </div>
    </div>
  );
}
