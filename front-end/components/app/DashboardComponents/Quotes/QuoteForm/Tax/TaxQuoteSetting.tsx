"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import styles from "./tax-quote-settings.module.css";

export interface TaxQuoteValues {
  vat_rate: string;
  valid_until: string;
  surcharge: string;
  notes: string;
  terms: string;
}

interface TaxQuoteSettingsProps {
  values: TaxQuoteValues;
  onChange: (values: TaxQuoteValues) => void;
  defaultNotes?: string | null;
  defaultTerms?: string | null;
  disabled?: boolean;
}

export default function TaxQuoteSettings({
  values,
  onChange,
  defaultNotes,
  defaultTerms,
  disabled = false,
}: TaxQuoteSettingsProps) {
  const uid = useId();

  function setField<K extends keyof TaxQuoteValues>(
    field: K,
    value: TaxQuoteValues[K],
  ) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor={`${uid}-vat`} className={styles.label}>
            IVA %
          </label>
          <Input
            id={`${uid}-vat`}
            inputMode="decimal"
            value={values.vat_rate}
            disabled={disabled}
            onChange={(e) => setField("vat_rate", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`${uid}-validity`} className={styles.label}>
            Valido fino a
          </label>
          <Input
            id={`${uid}-validity`}
            type="date"
            value={values.valid_until}
            disabled={disabled}
            onChange={(e) => setField("valid_until", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`${uid}-surcharge`} className={styles.label}>
            Maggiorazione %
          </label>
          <Input
            id={`${uid}-surcharge`}
            inputMode="decimal"
            value={values.surcharge}
            disabled={disabled}
            onChange={(e) => setField("surcharge", e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor={`${uid}-notes`} className={styles.label}>
            Note
          </label>
          {defaultNotes && values.notes !== defaultNotes && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setField("notes", defaultNotes)}
            >
              Ripristina predefinite
            </Button>
          )}
        </div>
        <textarea
          id={`${uid}-notes`}
          className={styles.textarea}
          rows={4}
          value={values.notes}
          disabled={disabled}
          onChange={(e) => setField("notes", e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor={`${uid}-terms`} className={styles.label}>
            Termini e condizioni
          </label>
          {defaultTerms && values.terms !== defaultTerms && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setField("terms", defaultTerms)}
            >
              Ripristina predefiniti
            </Button>
          )}
        </div>
        <textarea
          id={`${uid}-terms`}
          className={styles.textarea}
          rows={4}
          value={values.terms}
          disabled={disabled}
          onChange={(e) => setField("terms", e.target.value)}
        />
      </div>
    </div>
  );
}