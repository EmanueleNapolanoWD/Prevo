
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { registerUser } from "@/lib/auth";
import {
  registerSchema,
  type SignUpFormValues,
} from "@/lib/Validations/auth";

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

type FieldErrors = Partial<Record<keyof SignUpFormValues, string>>;

export default function RegisterPage() {
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
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setServerError("");
  }

  function input(
    field: keyof SignUpFormValues,
    label: string,
    type = "text",
    required = true,
  ) {
    return (
      <div key={field} className="space-y-1">
        <label htmlFor={field} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-600"> *</span>}
        </label>

        <input
          id={field}
          name={field}
          type={type}
          required={required}
          value={values[field]}
          onChange={(event) => updateField(field, event.target.value)}
          aria-invalid={Boolean(errors[field])}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        {errors[field] && (
          <p className="text-sm text-red-600">{errors[field]}</p>
        )}
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setServerError("");

    const result = registerSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignUpFormValues;

        if (!fieldErrors[field]) {
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
        if (error.response?.status === 422) {
          const backendErrors = error.response.data?.errors as
            | Record<string, string[]>
            | undefined;

          if (backendErrors) {
            const fieldErrors: FieldErrors = {};

            for (const [field, messages] of Object.entries(backendErrors)) {
              if (field in initialValues && messages?.[0]) {
                fieldErrors[field as keyof SignUpFormValues] = messages[0];
              }
            }

            setErrors(fieldErrors);
            setServerError(
              "Controlla i campi evidenziati: alcuni dati non sono validi o risultano già registrati.",
            );
          } else {
            setServerError("I dati inseriti non sono validi.");
          }
        } else if (error.response?.status === 419) {
          setServerError(
            "Sessione scaduta. Ricarica la pagina e riprova.",
          );
        } else {
          setServerError(
            error.response?.data?.message ??
              "Registrazione non riuscita. Riprova tra poco.",
          );
        }
      } else {
        setServerError("Impossibile contattare il server.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">PREVO</h1>
          <p className="mt-2 text-gray-600">
            Crea il tuo account e configura la tua azienda.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {serverError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {serverError}
            </div>
          )}

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Il tuo account</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {input("name", "Nome")}
              {input("surname", "Cognome")}
              {input("email", "Email personale", "email")}
              {input("password", "Password", "password")}
              {input(
                "password_confirmation",
                "Conferma password",
                "password",
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Dati aziendali</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {input("company_name", "Nome azienda")}
              {input("legal_name", "Ragione sociale")}
              {input("vat_number", "Partita IVA")}
              {input("tax_code", "Codice fiscale")}
              {input("company_email", "Email aziendale", "email")}
              {input("phone", "Telefono", "tel")}
              {input("address", "Indirizzo")}
              {input("postal_code", "CAP")}
              {input("city", "Città")}
              {input("province", "Provincia (es. NA)")}
              {input("website", "Sito web", "url", false)}
            </div>
          </section>

          <p className="text-xs text-gray-500">
            I campi contrassegnati con * sono obbligatori.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creazione account..." : "Crea account"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Hai già un account?{" "}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Accedi
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}