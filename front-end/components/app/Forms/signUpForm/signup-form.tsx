
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { registerUser } from "@/lib/Api/auth";
import {
  registerSchema,
  type SignUpFormValues,
} from "@/lib/Validations/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";

import styles from "./signup-form.module.css";

type FieldErrors = Partial<
  Record<keyof SignUpFormValues, string>
>;

const initialValues: SignUpFormValues = {
  name: "",
  surname: "",
  email: "",
  password: "",
  password_confirmation: "",
  company_name: "",
  legal_name: "",
  vat_number: "",
  tax_code: "",
  address: "",
  postal_code: "",
  city: "",
  province: "",
  company_email: "",
  phone: "",
  website: "",
};

export function SignupForm() {
  const router = useRouter();

  const [values, setValues] =
    useState<SignUpFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(
    field: keyof SignUpFormValues,
    value: string,
  ) {
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

  function renderInput(
    field: keyof SignUpFormValues,
    label: string,
    type = "text",
    required = true,
  ) {
    const error = errors[field];

    const autoComplete =
      field === "email" || field === "company_email"
        ? "email"
        : field === "password" ||
            field === "password_confirmation"
          ? "new-password"
          : field === "name"
            ? "given-name"
            : field === "surname"
              ? "family-name"
              : "off";

    return (
      <Field key={field} data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={field}>
          {label}
          {required && (
            <span className={styles.required}> *</span>
          )}
        </FieldLabel>

        <Input
          id={field}
          name={field}
          type={type}
          value={values[field]}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${field}-error` : undefined}
          disabled={loading}
          onChange={(event) =>
            updateField(field, event.target.value)
          }
        />

        {error && (
          <FieldDescription
            id={`${field}-error`}
            className={styles.fieldError}
          >
            {error}
          </FieldDescription>
        )}
      </Field>
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setErrors({});
    setServerError("");

    const result = registerSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignUpFormValues;

        if (
          field in initialValues &&
          !fieldErrors[field]
        ) {
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
            for (const [field, messages] of Object.entries(
              backendErrors,
            )) {
              if (
                field in initialValues &&
                messages?.[0]
              ) {
                fieldErrors[field as keyof SignUpFormValues] =
                  messages[0];
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
          setServerError(
            "Sessione scaduta. Ricarica la pagina e riprova.",
          );
        } else {
          setServerError(
            data?.message ??
              "Registrazione non riuscita. Riprova tra poco.",
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
          <form
            onSubmit={handleSubmit}
            noValidate
            className={styles.form}
          >
            {serverError && (
              <div
                role="alert"
                className={styles.serverError}
              >
                {serverError}
              </div>
            )}

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Il tuo account
              </h2>

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
              <h2 className={styles.sectionTitle}>
                Dati aziendali
              </h2>

              <FieldGroup className={styles.grid}>
                {renderInput("company_name", "Nome azienda")}
                {renderInput("legal_name", "Ragione sociale")}
                {renderInput("vat_number", "Partita IVA")}
                {renderInput("tax_code", "Codice fiscale")}
                {renderInput(
                  "company_email",
                  "Email aziendale",
                  "email",
                )}
                {renderInput("phone", "Telefono", "tel")}
                {renderInput("address", "Indirizzo")}
                {renderInput("postal_code", "CAP")}
                {renderInput("city", "Città")}
                {renderInput("province", "Provincia (es. NA)")}
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
              {loading
                ? "Creazione account..."
                : "Crea account"}
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
