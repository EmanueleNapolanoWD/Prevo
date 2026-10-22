"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import styles from "./quote-header.module.css";

export interface QuoteHeaderValues {
  number: string;
  title: string;
  description: string;
}

interface QuoteHeaderProps {
  values: QuoteHeaderValues;
  onChange: (values: QuoteHeaderValues) => void;
  disabled?: boolean;
}

export function QuoteHeader({ values, onChange, disabled = false}: QuoteHeaderProps) {
  const uid = useId();

  function setField<K extends keyof QuoteHeaderValues>(
    field: K,
    value: QuoteHeaderValues[K],
  ) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className={styles.grid}>
      <div className={styles.field}>
        <label htmlFor={`${uid}-number`} className={styles.label}>
          Numero preventivo
        </label>
        <Input
          id={`${uid}-number`}
          value={values.number}
          onChange={(e) => setField("number", e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor={`${uid}-title`} className={styles.label}>
          Oggetto preventivo
        </label>
        <Input
          id={`${uid}-title`}
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
        />
      </div>

      <div className={`${styles.field} ${styles.fieldWide}`}>
        <label htmlFor={`${uid}-description`} className={styles.label}>
          Descrizione
        </label>
        <textarea
          id={`${uid}-description`}
          className={styles.textarea}
          rows={2}
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
        />
      </div>
    </div>
  );
}