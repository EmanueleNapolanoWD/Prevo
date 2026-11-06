"use client";

import { useId } from "react";
import {
  COLOR_PRESETS,
  QUOTE_TEMPLATES,
  type QuoteAppearanceValues,
} from "@/lib/Utility/Quote/quote.types";
import styles from "./quote-templates.module.css";

interface QuoteAppearanceProps {
  values: QuoteAppearanceValues;
  onChange: (values: QuoteAppearanceValues) => void;
  disabled?: boolean;
}

export default function QuoteTemplate({
  values,
  onChange,
  disabled = false,
}: QuoteAppearanceProps) {
  const uid = useId();

  function setField<K extends keyof QuoteAppearanceValues>(
    field: K,
    value: QuoteAppearanceValues[K],
  ) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className={styles.root}>
      <fieldset className={styles.templates} disabled={disabled}>
        <legend className={styles.label}>Template</legend>

        <div className={styles.templateRow}>
          {QUOTE_TEMPLATES.map((t) => (
            <label
              key={t.key}
              className={`${styles.option} ${disabled ? styles.disabled : ""}`}
            >
              <input
                type="radio"
                name={`${uid}-template`}
                className={styles.radio}
                checked={values.template === t.key}
                onChange={() => setField("template", t.key)}
              />
              <span className={styles.optionLabel}>{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.colors}>
        <div className={styles.colorField}>
          <label htmlFor={`${uid}-primary`} className={styles.label}>
            Colore principale
          </label>
          <div className={styles.colorRow}>
            <input
              id={`${uid}-primary`}
              type="color"
              className={styles.colorInput}
              value={values.primaryColor}
              disabled={disabled}
              onChange={(e) => setField("primaryColor", e.target.value)}
            />
            <code className={styles.hex}>{values.primaryColor}</code>
          </div>
        </div>

        <div className={styles.colorField}>
          <label htmlFor={`${uid}-accent`} className={styles.label}>
            Colore di accento
          </label>
          <div className={styles.colorRow}>
            <input
              id={`${uid}-accent`}
              type="color"
              className={styles.colorInput}
              value={values.accentColor}
              disabled={disabled}
              onChange={(e) => setField("accentColor", e.target.value)}
            />
            <code className={styles.hex}>{values.accentColor}</code>
          </div>
        </div>
      </div>

      <div className={styles.presets} role="group" aria-label="Palette predefinite">
        {COLOR_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={styles.preset}
            disabled={disabled}
            onClick={() =>
              onChange({ ...values, primaryColor: p.primary, accentColor: p.accent })
            }
          >
            <span className={styles.swatch} style={{ background: p.primary }} />
            <span className={styles.swatch} style={{ background: p.accent }} />
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}