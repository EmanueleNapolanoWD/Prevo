"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { registerUser } from "@/lib/Api/Auth/auth";
import { registerSchema, type SignUpFormValues } from "@/lib/Validations/auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";

import styles from "./signup-form.module.css";

type FieldErrors = Partial<Record<keyof SignUpFormValues, string>>;
type SelectOption = { value: string; label: string };

const initialValues: SignUpFormValues = {
  // Account personale
  name: "",
  surname: "",
  email: "",
  password: "",
  password_confirmation: "",

  // Anagrafica aziendale
  company_name: "",
  legal_name: "",
  legal_form: "",

  // Dati fiscali
  country_code: "IT",
  vat_number: "",
  tax_code: "",
  tax_regime: "",
  sdi_code: "",
  pec: "",

  // Dati REA
  rea_office: "",
  rea_number: "",
  share_capital: "",
  ateco_code: "",
  iban: "",

  // Sede legale
  address: "",
  postal_code: "",
  city: "",
  province: "",

  // Contatti
  company_email: "",
  phone: "",
  website: "",
};

// Costanti fuori dal componente: non vengono ricreate a ogni render.
const LEGAL_FORMS: SelectOption[] = [
  { value: "", label: "Seleziona la forma giuridica" },
  { value: "DITTA_INDIVIDUALE", label: "Ditta individuale" },
  { value: "SRL", label: "S.r.l." },
  { value: "SRLS", label: "S.r.l.s." },
  { value: "SPA", label: "S.p.A." },
  { value: "SNC", label: "S.n.c." },
  { value: "SAS", label: "S.a.s." },
  { value: "SOCIETA_SEMPLICE", label: "Società semplice" },
  { value: "ALTRO", label: "Altro" },
];

const COUNTRIES: SelectOption[] = [
  { value: "IT", label: "Italia" },
  { value: "DE", label: "Germania" },
  { value: "FR", label: "Francia" },
  { value: "ES", label: "Spagna" },
  { value: "AT", label: "Austria" },
  { value: "CH", label: "Svizzera" },
  { value: "BE", label: "Belgio" },
  { value: "NL", label: "Paesi Bassi" },
  { value: "PT", label: "Portogallo" },
  { value: "GB", label: "Regno Unito" },
];

const TAX_REGIMES: SelectOption[] = [
  { value: "", label: "Seleziona il regime fiscale" },
  { value: "RF01", label: "RF01 - Ordinario" },
  { value: "RF02", label: "RF02 - Contribuenti minimi" },
  { value: "RF04", label: "RF04 - Agricoltura" },
  { value: "RF05", label: "RF05 - Vendita sali e tabacchi" },
  {
    value: "RF06",
    label: "RF06 - Gestione di servizi di telefonia pubblica",
  },
  {
    value: "RF07",
    label: "RF07 - Rivendita documenti di trasporto pubblico",
  },
  { value: "RF08", label: "RF08 - Editoria" },
  {
    value: "RF09",
    label: "RF09 - Attività di intrattenimento e giochi",
  },
  { value: "RF10", label: "RF10 - Agenzie di viaggi" },
  { value: "RF11", label: "RF11 - Agriturismo" },
  { value: "RF12", label: "RF12 - Vendite a domicilio" },
  {
    value: "RF13",
    label: "RF13 - Beni usati e altri casi speciali",
  },
  {
    value: "RF14",
    label: "RF14 - Agenzie di vendite all'asta",
  },
  { value: "RF15", label: "RF15 - IVA per cassa" },
  { value: "RF16", label: "RF16 - Altri casi particolari" },
  { value: "RF17", label: "RF17 - IVA per cassa (PA)" },
  { value: "RF18", label: "RF18 - Altro" },
  { value: "RF19", label: "RF19 - Regime forfettario" },
];

function getAutoComplete(field: keyof SignUpFormValues) {
  switch (field) {
    case "email":
    case "company_email":
      return "email";
    case "password":
    case "password_confirmation":
      return "new-password";
    case "name":
      return "given-name";
    case "surname":
      return "family-name";
    case "phone":
      return "tel";
    default:
      return "off";
  }
}

export function SignupForm() {
  const router = useRouter();

  const [values, setValues] = useState<SignUpFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof SignUpFormValues, value: string) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));

    setServerError("");
  }

  function renderError(field: keyof SignUpFormValues) {
    const error = errors[field];

    if (!error) return null;

    return (
      <FieldDescription id={`${field}-error`} className={styles.fieldError}>
        {error}
      </FieldDescription>
    );
  }

  function renderLabel(
    field: keyof SignUpFormValues,
    label: string,
    required: boolean,
  ) {
    return (
      <FieldLabel htmlFor={field}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </FieldLabel>
    );
  }

  function renderInput(
    field: keyof SignUpFormValues,
    label: string,
    type = "text",
    required = true,
  ) {
    const error = errors[field];

    return (
      <Field key={field} data-invalid={Boolean(error)}>
        {renderLabel(field, label, required)}

        <Input
          id={field}
          name={field}
          type={type}
          value={values[field]}
          required={required}
          autoComplete={getAutoComplete(field)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${field}-error` : undefined}
          disabled={loading}
          onChange={(event) => updateField(field, event.target.value)}
        />

        {renderError(field)}
      </Field>
    );
  }

  function renderSelect(
    field: keyof SignUpFormValues,
    label: string,
    options: SelectOption[],
    required = true,
  ) {
    const error = errors[field];

    return (
      <Field key={field} data-invalid={Boolean(error)}>
        {renderLabel(field, label, required)}

        <select
          id={field}
          name={field}
          value={values[field]}
          required={required}
          disabled={loading}
          className={styles.select}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${field}-error` : undefined}
          onChange={(event) => updateField(field, event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {renderError(field)}
      </Field>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setErrors({});
    setServerError("");

    const result = registerSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignUpFormValues;

        if (field in initialValues && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      await registerUser(result.data);

      router.replace("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 422) {
          const backendErrors = data?.errors as
            | Record<string, string[]>
            | undefined;

          const fieldErrors: FieldErrors = {};

          if (backendErrors) {
            for (const [field, messages] of Object.entries(backendErrors)) {
              if (field in initialValues && messages?.[0]) {
                fieldErrors[field as keyof SignUpFormValues] = messages[0];
              }
            }
          }

          setErrors(fieldErrors);
          setServerError(
            Object.keys(fieldErrors).length > 0
              ? "Controlla i campi evidenziati: alcuni dati non sono validi o risultano già registrati."
              : "I dati inseriti non sono validi.",
          );
        } else if (status === 419) {
          setServerError("Sessione scaduta. Ricarica la pagina e riprova.");
        } else {
          setServerError(
            data?.message ?? "Registrazione non riuscita. Riprova tra poco.",
          );
        }
      } else {
        setServerError(
          error instanceof Error
            ? error.message
            : "Impossibile completare la registrazione.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.brand}>PREVO</h1>
        <p className={styles.subtitle}>
          Crea il tuo account e configura la tua azienda.
        </p>
      </header>

      <Card className={styles.card}>
        <CardHeader>
          <CardTitle className={styles.cardTitle}>
            Crea il tuo account
          </CardTitle>
          <CardDescription>
            Inserisci i tuoi dati personali e quelli della tua azienda.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            {serverError && (
              <div role="alert" className={styles.serverError}>
                {serverError}
              </div>
            )}

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Il tuo account</h2>

              <FieldGroup className={styles.grid}>
                {renderInput("name", "Nome")}
                {renderInput("surname", "Cognome")}
                {renderInput("email", "Email personale", "email")}
                {renderInput("password", "Password", "password")}
                {renderInput(
                  "password_confirmation",
                  "Conferma password",
                  "password",
                )}
              </FieldGroup>
            </section>

            <FieldSeparator />

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Anagrafica aziendale</h2>

              <FieldGroup className={styles.grid}>
                {renderInput("company_name", "Nome azienda")}
                {renderInput("legal_name", "Ragione sociale")}
                {renderSelect("legal_form", "Forma giuridica", LEGAL_FORMS)}
                {renderSelect("country_code", "Paese", COUNTRIES)}
              </FieldGroup>
            </section>

            <FieldSeparator />

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Dati fiscali</h2>

              <FieldGroup className={styles.grid}>
                {renderInput("vat_number", "Partita IVA")}
                {renderInput("tax_code", "Codice fiscale")}
                {renderSelect("tax_regime", "Regime fiscale", TAX_REGIMES)}
                {renderInput(
                  "sdi_code",
                  "Codice destinatario SDI",
                  "text",
                  false,
                )}
                {renderInput("pec", "PEC aziendale", "email", false)}
              </FieldGroup>
            </section>

            <FieldSeparator />

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Dati REA e societari</h2>

              <FieldGroup className={styles.grid}>
                {renderInput(
                  "rea_office",
                  "Provincia ufficio REA",
                  "text",
                  false,
                )}
                {renderInput("rea_number", "Numero REA", "text", false)}
                {renderInput(
                  "share_capital",
                  "Capitale sociale (€)",
                  "text",
                  false,
                )}
                {renderInput("ateco_code", "Codice ATECO", "text", false)}
                {renderInput("iban", "IBAN aziendale", "text", false)}
              </FieldGroup>
            </section>

            <FieldSeparator />

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Sede legale e contatti</h2>

              <FieldGroup className={styles.grid}>
                {renderInput("address", "Indirizzo")}
                {renderInput("postal_code", "CAP")}
                {renderInput("city", "Città")}
                {renderInput("province", "Provincia (es. NA)")}
                {renderInput("company_email", "Email aziendale", "email")}
                {renderInput("phone", "Telefono", "tel")}
                {renderInput("website", "Sito web", "url", false)}
              </FieldGroup>
            </section>

            <p className={styles.requiredNote}>
              I campi contrassegnati con * sono obbligatori.
            </p>

            <Button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Creazione account..." : "Crea account"}
            </Button>

            <p className={styles.loginText}>
              Hai già un account?{" "}
              <a href="/login" className={styles.loginLink}>
                Accedi
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
