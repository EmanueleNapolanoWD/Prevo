"use client";

import { useId } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { CONTACTS_LABEL } from "@/lib/Utility/Clients/clients.schema";
import styles from "../clients-form.module.css";

type Props = {
  name: "emails" | "phones";
  valueKey: "email" | "phone";
  label: string;
  placeholder: string;
  addLabel: string;
  inputType?: string;
};

/** Lista di input ripetibili (email, telefoni) con etichetta Lavoro/Privato/Altro. */
export function RepeatableInputs({
  name,
  valueKey,
  label,
  placeholder,
  addLabel,
  inputType = "text",
}: Props) {
  const { control } = useFormContext();
  const labelId = useId();
  // keyName diverso da "id": le righe in update hanno già un loro id dal database
  const { fields, append, remove } = useFieldArray({
    control,
    name,
    keyName: "fieldKey",
  });

  return (
    <div className={styles.field}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>

      <div className={styles.repeatList} role="group" aria-labelledby={labelId}>
        {fields.map((row, i) => (
          <div key={row.fieldKey} className={styles.repeatRow}>
            <Controller
              control={control}
              name={`${name}.${i}.${valueKey}`}
              render={({ field, fieldState }) => (
                <div className={styles.repeatMain}>
                  <input
                    type={inputType}
                    placeholder={placeholder}
                    aria-label={label}
                    aria-invalid={fieldState.invalid || undefined}
                    className={styles.input}
                    {...field}
                    value={field.value ?? ""}
                  />
                  {fieldState.invalid && (
                    <p role="alert" className={styles.error}>
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              control={control}
              name={`${name}.${i}.label`}
              render={({ field }) => (
                <div className={`${styles.selectWrap} ${styles.repeatLabel}`}>
                  <select
                    aria-label={`Etichetta ${label.toLowerCase()}`}
                    name={field.name}
                    ref={field.ref}
                    className={styles.select}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                  >
                    {CONTACTS_LABEL.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={styles.chevron} aria-hidden="true" />
                </div>
              )}
            />

            {fields.length > 1 && (
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Rimuovi ${label.toLowerCase()}`}
                onClick={() => remove(i)}
              >
                <Trash2 aria-hidden="true" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className={styles.addButton}
          onClick={() => append({ [valueKey]: "", label: "Lavoro" })}
        >
          <Plus aria-hidden="true" />
          {addLabel}
        </button>
      </div>
    </div>
  );
}
