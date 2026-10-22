"use client";

import { useId, type CSSProperties } from "react";
import { readableTextColor } from "@/lib/utils";
import {
  COLOR_PRESETS,
  QUOTE_TEMPLATES,
  type QuoteAppearanceValues,
  type QuoteTemplateKey,
} from "@/types/quote";
import styles from "./quote-templates.module.css";

interface QuoteAppearanceProps {
  values: QuoteAppearanceValues;
  onChange: (values: QuoteAppearanceValues) => void;
  disabled?: boolean;
}

function MiniPreview({
  template,
  primary,
  accent,
}: {
  template: QuoteTemplateKey;
  primary: string;
  accent: string;
}) {
  const vars = {
    "--primary": primary,
    "--accent": accent,
    "--on-primary": readableTextColor(primary),
  } as CSSProperties;

  return (
    <div className={styles.preview} data-template={template} style={vars}>
      <div className={styles.pvHeader}>
        <span className={styles.pvLogo} />
        <span className={styles.pvTitle}>PREVENTIVO</span>
      </div>
      <div className={styles.pvLines}>
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className={styles.pvTotal} />
    </div>
  );
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

        {QUOTE_TEMPLATES.map((t) => (
          <label
            key={t.key}
            className={`${styles.card} ${disabled ? styles.disabled : ""}`}
          >
            <input
              type="radio"
              name={`${uid}-template`}
              className={styles.radio}
              checked={values.template === t.key}
              onChange={() => setField("template", t.key)}
            />
            <MiniPreview
              template={t.key}
              primary={values.primaryColor}
              accent={values.accentColor}
            />
            <span className={styles.cardLabel}>{t.label}</span>
            <span className={styles.cardDesc}>{t.description}</span>
          </label>
        ))}
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