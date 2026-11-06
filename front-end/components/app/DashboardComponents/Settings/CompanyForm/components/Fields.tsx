import type { HTMLAttributes } from "react";
import styles from "../companyform.module.css";
import type { TextFieldName } from "@/lib/Utility/Companies/companies.type";

type FieldProps = {
  name: TextFieldName;
  label: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  type?: string;
  maxLength?: number;
  pattern?: string;
};

export default function Field({
  name,
  label,
  defaultValue,
  placeholder,
  required,
  className = "",
  inputMode,
  type = "text",
  maxLength,
  pattern,
}: FieldProps) {
  return (
    <div className={`${styles.field} ${className}`}>
      <label htmlFor={name}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        pattern={pattern}
        defaultValue={defaultValue ?? ""}
        aria-describedby={required ? `${name}-hint` : undefined}
      />
      {required && (
        <span id={`${name}-hint`} className={styles.fieldHint}>
          Campo obbligatorio
        </span>
      )}
    </div>
  );
}
