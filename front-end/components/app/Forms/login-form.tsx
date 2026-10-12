"use client";

import { cn } from "cn";

// HOOKS
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { loginSchema, type LoginFormValues } from "@/lib/Validations/auth";

//componenti UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/auth";

// TYPES E INTERFACES
interface LaravelValidatorError {
  message?: string;
  errors?: Record<string, string[]>;
}

// ==========================

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginFormValues, string>>
  >({});
  const [error, setError] = useState("");
  const [isSubmitting, setIssubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = loginSchema.safeParse({
      email,
      password,
    });

    if (!result.success) {
      const error = result.error.flatten().fieldErrors;

      setFieldErrors({
        email: error.email?.[0],
        password: error.password?.[0],
      });

      return;
    }

    setFieldErrors({});
    setError("");
    setIssubmitting(true);

    try {
      await login(result.data);

      router.replace("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (axios.isAxiosError<LaravelValidatorError>(err)) {
        const response = err.response;

        if (response?.status === 422) {
          const validationErrors = response.data?.errors;
          const firstError = validationErrors
            ? Object.values(validationErrors).flat()[0]
            : undefined;

          setError(
            firstError ??
              response.data?.message ??
              "Le Credenziali inserite non sono valide.",
          );
        } else if (response?.status === 419) {
          setError("La sessione di sicurezza è scaduta. Riprova.");
        } else if (response) {
          setError("Impossibile effettuare il login. Riprova!");
        } else {
          setError(
            "Non riesco a contattare il server. Verifica la connessione.",
          );
        }
      } else {
        setError("Si è verificato un errore imprevisto.");
      }
    } finally {
      setIssubmitting(false);
    }
  }

  // VIEW
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Accedi a Prevo</CardTitle>
          <CardDescription>
            Inserisci credenziali del tuo account
          </CardDescription>
        </CardHeader>

        {/* =========================================== */}
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {/* EMAIL */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="esempio@company.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    setError("");
                  }}
                  disabled={isSubmitting}
                  required
                />

                {fieldErrors.email && (
                  <p className="text-sm text-destructive" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </Field>

              {/* PASSWORD */}
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Password Dimenticata?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                    setError("");
                  }}
                  disabled={isSubmitting}
                  required
                />

                {fieldErrors.password && (
                  <p className="text-sm text-destructive" role="alert">
                    {fieldErrors.password}
                  </p>
                )}
              </Field>

              {/* ERROR BLOCK */}
              {error && (
                <p
                  className="text-sm text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </p>
              )}

              {/* BUTTONS SUBMIT */}
              <Field>
                {/* E/P LOGIN */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !email.trim() || !password}
                >
                  {isSubmitting ? "Accesso in corso ..." : "Accedi"}
                </Button>

                {/* LOGIN CON PORVIDERS */}
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Non hai un account? <Link href="#">Registrati</Link>
                </FieldDescription>

                <FieldDescription className="text-center">
                  Accedendo, utilizzerai la sessione sicura di PREVO.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
