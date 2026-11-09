"use client";

import { useState } from "react";
import { Sparkles, CheckCircle, LoaderCircle } from "lucide-react";

import type { UseQuoteFormReturn } from "@/components/app/DashboardComponents/Quotes/hooks/useQuoteForm";
import { mapDraftToFormValues } from "@/lib/Utility/Quote/quote-draft-mappers";
import { generateQuoteDraftAction } from "@/lib/Api/Quote/quote.action";

import styles from "./quote-ai-section.module.css";

interface QuoteAiSectionProps {
  mode: "create" | "edit";
  slug: string;
  form: UseQuoteFormReturn;
}

export function QuoteAiSection({ mode, slug, form }: QuoteAiSectionProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const {
    header,
    settings,
    clientQuery,
    setHeader,
    setTax,
    setItems,
    setSelectedClient,
    setClientQuery,
  } = form;

  async function handleGenerate(): Promise<void> {
    const text = prompt.trim();

    if (text.length < 10 || loading) {
      return;
    }

    // Evita di sovrascrivere i dati già inseriti senza conferma.
    const hasExistingData =
      form.items.length > 0 ||
      Object.values(form.header).some(
        (value) => value !== "" && value !== null && value !== undefined,
      ) ||
      clientQuery.trim() !== "" ||
      form.selectedClient !== null ||
      form.tax.notes.trim() !== "" ||
      form.tax.terms.trim() !== "";

    if (hasExistingData) {
      const confirmed = window.confirm(
        "I dati attuali del form verranno sovrascritti con la bozza generata dall'AI. Continuare?",
      );

      if (!confirmed) {
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setDismissed(false);

    try {
      const res = await generateQuoteDraftAction(slug, text);

      if (!res.ok) {
        setError(res.message ?? "Impossibile generare la bozza con l'AI.");
        return;
      }

      const mapped = mapDraftToFormValues(res.data, {
        settings,
      });

      console.log("header: ", header);

      // Applica header.
      setHeader(mapped.header);

      // Sostituisce le voci esistenti.
      setItems(mapped.items);

      // Applica i dati fiscali generati.
      setTax({
        ...form.tax,
        vat_rate: mapped.tax.vat_rate,
        valid_until: mapped.tax.valid_until,
        notes: mapped.tax.notes || (form.tax.notes ?? ""),
      });

      // Applica il cliente già recuperato dal backend.
      if (mapped.client) {
        setSelectedClient(mapped.client);
      } else {
        setSelectedClient(null);

        if (mapped.clientName) {
          setClientQuery(mapped.clientName);
        }
      }

      // Mostra eventuali avvisi relativi al cliente.
      if (mapped.clientWarning) {
        window.alert(mapped.clientWarning);
      }

      setSuccess(true);
    } catch {
      setError("Errore di rete: impossibile generare la bozza. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  // Nella modifica non mostrare la sezione.
  if (mode !== "create") {
    return null;
  }

  return (
    <section className={styles.section} aria-label="Generazione con AI">
      <div className={styles.header}>
        <h3 className={styles.sectionTitle}>Genera con AI</h3>

        <span className={styles.label}>
          <Sparkles size={14} className={styles.icon} />
          Bozza automatica
        </span>
      </div>

      <p className={styles.help}>
        Descrivi il lavoro in parole semplici. L&apos;AI genererà una bozza del
        preventivo che puoi rivedere e correggere prima di salvare.
      </p>

      <div className={styles.textareaWrap}>
        <textarea
          id="quote-ai-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          maxLength={2000}
          placeholder="Es. Preventivo per Mario Rossi: sito vetrina di 5 pagine con SEO base, layout responsive e KPI di conversione."
          rows={4}
          className={styles.textarea}
          aria-describedby="quote-ai-counter"
          disabled={loading}
        />

        <div
          className={styles.counter}
          id="quote-ai-counter"
          aria-live="polite"
        >
          <span className={styles.counterValue}>{prompt.length}</span>

          <span className={styles.counterLabel}>/ 2000</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || prompt.trim().length < 10}
          className={styles.generateButton}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <LoaderCircle size={17} className={styles.buttonSpinner} />
              <span>Sto generando…</span>
            </>
          ) : (
            <>
              <Sparkles size={17} strokeWidth={2} />
              <span>Genera con AI</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      {success && (
        <div className={styles.success} role="status">
          <CheckCircle size={16} className={styles.successIcon} />

          <span>
            Bozza generata dall&apos;AI: controlla voci, prezzi e cliente prima
            di salvare.
          </span>

          {!dismissed && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className={styles.dismissButton}
              aria-label="Chiudi l'avviso"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </section>
  );
}
