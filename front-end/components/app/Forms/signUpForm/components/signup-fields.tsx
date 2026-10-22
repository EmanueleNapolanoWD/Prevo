"use client";

import { useState } from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  FIELD_CONFIG,
  type FieldName,
} from "@/lib/Utility/Auth/SignUp/sign-up.fields";

import styles from "../signup-form.module.css";

interface SignupFieldProps {
  name: FieldName;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (field: FieldName, value: string) => void;
}

export function SignupField({
  name,
  value,
  error,
  disabled,
  onChange,
}: SignupFieldProps) {
  const config = FIELD_CONFIG[name];
  const [showPassword, setShowPassword] = useState(false);

  const required = config.required ?? true;
  const errorId = `${name}-error`;
  const autoComplete = config.autoComplete ?? "off";
  const aria = {
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
  };

  const isPassword = config.kind === "input" && config.type === "password";

  return (
    <Field
      data-invalid={Boolean(error)}
      className={config.wide ? styles.wide : undefined}
    >
      <FieldLabel htmlFor={name}>
        {config.label}
        {required && (
          <span className={styles.required} aria-hidden>
            {" "}
            *
          </span>
        )}
      </FieldLabel>

      {config.kind === "select" ? (
        <div className={styles.selectWrap}>
          <select
            id={name}
            name={name}
            value={value}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            className={styles.select}
            onChange={(e) => onChange(name, e.target.value)}
            {...aria}
          >
            {config.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className={styles.selectIcon} aria-hidden />
        </div>
      ) : (
        <div className={styles.inputWrap}>
          <Input
            id={name}
            name={name}
            type={isPassword && showPassword ? "text" : (config.type ?? "text")}
            value={value}
            required={required}
            disabled={disabled}
            placeholder={config.placeholder}
            inputMode={config.inputMode}
            autoComplete={autoComplete}
            className={isPassword ? styles.inputWithAction : undefined}
            onChange={(e) => onChange(name, e.target.value)}
            {...aria}
          />

          {isPassword && (
            <button
              type="button"
              className={styles.inputAction}
              aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
            </button>
          )}
        </div>
      )}

      {error && (
        <FieldDescription id={errorId} className={styles.fieldError}>
          {error}
        </FieldDescription>
      )}
    </Field>
  );
}