"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateCompanyDataAction } from "@/lib/Api/Company/company.action";
import type { CompanyFormState, CompanyValues } from "@/types/company";
import styles from "./companyform.module.css";

type Props = {
  slug: string;
  initialValues?: CompanyValues;
};

const initialState: CompanyFormState = { ok: false };

const LOGO_ACCEPT = "image/png,image/jpeg,image/webp";
const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

type FieldProps = {
  name: keyof CompanyValues;
  label: string;
  values?: CompanyValues;
  errors?: Record<string, string[]>;
  type?: string;
  required?: boolean;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "decimal" | "email" | "tel" | "url";
  className?: string;
};

function Field({
  name,
  label,
  values,
  errors,
  type = "text",
  required,
  maxLength,
  inputMode,
  className,
}: FieldProps) {
  const error = errors?.[name]?.[0];
  const value = values?.[name];

  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span aria-hidden> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        inputMode={inputMode}
        defaultValue={value == null ? "" : String(value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={styles.input}
      />
      {error && (
        <p id={`${name}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

type LogoFieldProps = {
  currentUrl?: string | null;
  error?: string;
};

function LogoField({ currentUrl, error }: LogoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [clientError, setClientError] = useState<string>();

  // libera l'URL temporaneo dell'anteprima quando cambia o il componente si smonta
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function clearInput() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setClientError(undefined);

    if (!file) {
      setPreview(null);
      return;
    }

    if (!LOGO_ACCEPT.split(",").includes(file.type)) {
      clearInput();
      setClientError("Formato non supportato: usa PNG, JPG o WebP.");
      return;
    }

    if (file.size > LOGO_MAX_BYTES) {
      clearInput();
      setClientError("Il file supera i 2 MB.");
      return;
    }

    setRemoved(false);
    setPreview(URL.createObjectURL(file));
  }

  function handleRemove() {
    clearInput();
    setClientError(undefined);
    // la rimozione lato server ha senso solo se esiste già un logo salvato
    if (currentUrl) setRemoved(true);
  }

  const shownUrl = preview ?? (removed ? null : currentUrl);
  const message = clientError ?? error;

  return (
    <div className={`${styles.field} ${styles.fullWidth}`}>
      <label htmlFor="logo" className={styles.label}>
        Logo
      </label>

      <div className={styles.logoRow}>
        <div className={styles.logoPreview}>
          {shownUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownUrl} alt="Anteprima logo azienda" />
          ) : (
            <span>Nessun logo</span>
          )}
        </div>

        <div className={styles.logoControls}>
          <input
            ref={inputRef}
            id="logo"
            name="logo"
            type="file"
            accept={LOGO_ACCEPT}
            onChange={handleChange}
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? "logo-error" : "logo-hint"}
            className={styles.input}
          />
          <p id="logo-hint" className={styles.hint}>
            PNG, JPG o WebP, massimo 2 MB.
          </p>

          {shownUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className={styles.linkButton}
            >
              Rimuovi logo
            </button>
          )}

          {removed && (
            <p className={styles.hint}>
              Il logo verrà rimosso al salvataggio.{" "}
              <button
                type="button"
                onClick={() => setRemoved(false)}
                className={styles.linkButton}
              >
                Annulla
              </button>
            </p>
          )}
        </div>
      </div>

      {removed && <input type="hidden" name="remove_logo" value="1" />}

      {message && (
        <p id="logo-error" role="alert" className={styles.error}>
          {message}
        </p>
      )}
    </div>
  );
}

export default function CompanyForm({ slug, initialValues }: Props) {
  const [state, formAction, pending] = useActionState(
    updateCompanyDataAction.bind(null, slug),
    initialState,
  );

  // dopo un 422 riusa i valori inviati, così l'utente non perde ciò che ha scritto
  const common = {
    values: state.values ?? initialValues,
    errors: state.errors,
  };

  return (
    <form action={formAction} className={styles.form}>
      <fieldset className={styles.section}>
        <legend className={styles.legend}>Anagrafica</legend>
        <LogoField
          currentUrl={initialValues?.logo_url}
          error={state.errors?.logo?.[0]}
        />
        <Field name="name" label="Nome commerciale" required {...common} />
        <Field name="legal_name" label="Ragione sociale" {...common} />
        <Field name="legal_form" label="Forma giuridica" {...common} />
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Dati fiscali</legend>
        <Field
          name="country_code"
          label="Paese (ISO)"
          maxLength={2}
          required
          {...common}
        />
        <Field name="vat_number" label="Partita IVA" required {...common} />
        <Field
          name="tax_code"
          label="Codice fiscale"
          maxLength={16}
          {...common}
        />
        <Field name="tax_regime" label="Regime fiscale" {...common} />
        <Field name="sdi_code" label="Codice SDI" maxLength={7} {...common} />
        <Field
          name="pec"
          label="PEC"
          type="email"
          inputMode="email"
          {...common}
        />
        <Field
          name="rea_office"
          label="Ufficio REA (sigla)"
          maxLength={2}
          {...common}
        />
        <Field name="rea_number" label="Numero REA" {...common} />
        <Field
          name="share_capital"
          label="Capitale sociale (€)"
          inputMode="decimal"
          {...common}
        />
        <Field name="ateco_code" label="Codice ATECO" {...common} />
        <Field
          name="iban"
          label="IBAN"
          className={styles.fullWidth}
          {...common}
        />
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Sede legale</legend>
        <Field
          name="address"
          label="Indirizzo"
          required
          className={styles.fullWidth}
          {...common}
        />
        <Field
          name="postal_code"
          label="CAP"
          maxLength={5}
          inputMode="numeric"
          required
          {...common}
        />
        <Field name="city" label="Città" required {...common} />
        <Field
          name="province"
          label="Provincia"
          maxLength={2}
          required
          {...common}
        />
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Contatti</legend>
        <Field
          name="email"
          label="Email"
          type="email"
          inputMode="email"
          required
          {...common}
        />
        <Field
          name="phone"
          label="Telefono"
          type="tel"
          inputMode="tel"
          {...common}
        />
        <Field
          name="website"
          label="Sito web"
          type="url"
          inputMode="url"
          className={styles.fullWidth}
          {...common}
        />
      </fieldset>

      <div className={styles.footer}>
        {state.message && (
          <p
            role={state.ok ? "status" : "alert"}
            className={state.ok ? styles.success : styles.error}
          >
            {state.message}
          </p>
        )}
        <button type="submit" disabled={pending} className={styles.submit}>
          {pending ? "Salvataggio…" : "Salva"}
        </button>
      </div>
    </form>
  );
}
