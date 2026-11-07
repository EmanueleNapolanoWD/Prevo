"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import {
  Controller,
  useFormContext,
  type ControllerRenderProps,
  type FieldValues,
} from "react-hook-form";
import styles from "../clients-form.module.css";

// I campi usano i nomi come stringhe ("addresses.0.street"), quindi qui il form è tipizzato in modo largo.
type RenderField = ControllerRenderProps<FieldValues, string>;
type FieldMeta = { id: string; invalid: boolean };

/** Card di sezione: icona, eyebrow numerato ("01 · IDENTITÀ"), titolo e descrizione. */
export function Section({
  step,
  eyebrow,
  icon: Icon,
  title,
  description,
  children,
}: {
  step: number;
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.card}>
      <header className={styles.cardHeader}>
        <span className={styles.cardIcon}>
          <Icon aria-hidden="true" />
        </span>
        <div>
          <p className={styles.eyebrow}>
            {String(step).padStart(2, "0")} · {eyebrow}
          </p>
          <h2 className={styles.cardTitle}>{title}</h2>
          {description && (
            <p className={styles.cardDescription}>{description}</p>
          )}
        </div>
      </header>

      <div className={styles.body}>{children}</div>
    </section>
  );
}

/** Griglia dei campi: 2 colonne di default, 3 per CAP / città / provincia. */
export function FieldGrid({
  columns = 2,
  children,
}: {
  columns?: 2 | 3;
  children: ReactNode;
}) {
  return (
    <div className={columns === 3 ? styles.grid3 : styles.grid}>{children}</div>
  );
}

/** Etichetta sopra + controllo + errore, collegata a react-hook-form con Controller. */
export function FieldRow({
  name,
  label,
  children,
}: {
  name: string;
  label: string;
  children: (field: RenderField, meta: FieldMeta) => ReactNode;
}) {
  const { control } = useFormContext();
  const baseId = useId();
  const id = `${baseId}-${name}`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={styles.field}>
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
          {children(field, { id, invalid: fieldState.invalid })}
          {fieldState.invalid && (
            <p role="alert" className={styles.error}>
              {fieldState.error?.message}
            </p>
          )}
        </div>
      )}
    />
  );
}

type InputProps = Omit<
  ComponentProps<"input">,
  "name" | "value" | "onChange" | "className"
>;

export function TextField({
  name,
  label,
  uppercase,
  ...props
}: { name: string; label: string; uppercase?: boolean } & InputProps) {
  return (
    <FieldRow name={name} label={label}>
      {(field, { id, invalid }) => (
        <input
          id={id}
          aria-invalid={invalid || undefined}
          className={`${styles.input} ${uppercase ? styles.uppercase : ""}`}
          {...props}
          {...field}
          value={field.value ?? ""}
        />
      )}
    </FieldRow>
  );
}

type TextareaProps = Omit<
  ComponentProps<"textarea">,
  "name" | "value" | "onChange" | "className"
>;

export function TextareaField({
  name,
  label,
  ...props
}: { name: string; label: string } & TextareaProps) {
  return (
    <FieldRow name={name} label={label}>
      {(field, { id, invalid }) => (
        <textarea
          id={id}
          aria-invalid={invalid || undefined}
          className={`${styles.input} ${styles.textarea}`}
          {...props}
          {...field}
          value={field.value ?? ""}
        />
      )}
    </FieldRow>
  );
}

export function SelectField({
  name,
  label,
  options,
  placeholder,
  clearLabel,
}: {
  name: string;
  label: string;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
  /** Se presente, aggiunge una voce per svuotare la selezione */
  clearLabel?: string;
}) {
  const hasEmptyOption = Boolean(placeholder || clearLabel);

  return (
    <FieldRow name={name} label={label}>
      {(field, { id, invalid }) => {
        const isEmpty = !field.value;

        return (
          <div className={styles.selectWrap}>
            <select
              id={id}
              name={field.name}
              ref={field.ref}
              aria-invalid={invalid || undefined}
              className={`${styles.select} ${isEmpty ? styles.selectEmpty : ""}`}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
            >
              {/* Da vuoto mostra il placeholder; con un valore scelto la voce diventa "svuota" */}
              {hasEmptyOption && (
                <option value="">
                  {isEmpty
                    ? (placeholder ?? clearLabel)
                    : (clearLabel ?? placeholder)}
                </option>
              )}
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className={styles.chevron} aria-hidden="true" />
          </div>
        );
      }}
    </FieldRow>
  );
}

/** Switch nativo con etichetta a destra: switch e testo restano sempre allineati. */
export function Toggle({
  label,
  ...props
}: { label: string } & Omit<ComponentProps<"input">, "type" | "className">) {
  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        role="switch"
        className={styles.toggleInput}
        {...props}
      />
      <span className={styles.track} aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

export function SwitchField({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Toggle
          label={label}
          name={field.name}
          checked={!!field.value}
          onChange={(e) => field.onChange(e.target.checked)}
          onBlur={field.onBlur}
        />
      )}
    />
  );
}
