
"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { resetPassword } from "@/lib/Api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";
  const initialEmail = searchParams.get("email") ?? "";

  const router = useRouter();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setpasswordConfirmation] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setStatus("error");
      return;
    }

    if (password !== passwordConfirmation) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    try {
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password aggiornata</CardTitle>
          <CardDescription role="status" aria-live="polite">
            La tua password è stata reimpostata correttamente.
            Ora puoi accedere a Prevo con la nuova password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            className="w-full"
            onClick={() => {
                router.push("/login")
            }}
          >
            Vai al login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          Reimposta la password
        </CardTitle>
        <CardDescription>
          Inserisci la tua nuova password e confermala per
          completare la procedura.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nome@azienda.it"
              required
              disabled={status === "submitting"}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password">Nuova password</label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              disabled={status === "submitting"}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password_confirmation">
              Conferma nuova password
            </label>
            <Input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(event) =>
                setpasswordConfirmation(event.target.value)
              }
              minLength={8}
              required
              disabled={status === "submitting"}
            />
          </div>

          {status === "error" && (
            <p role="alert" className="text-sm text-destructive">
              {!token
                ? "Il link di reimpostazione non è valido o non contiene il token."
                : password !== passwordConfirmation
                  ? "Le password non coincidono."
                  : "Non è stato possibile reimpostare la password. Il link potrebbe essere scaduto o non valido."}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={status === "submitting"}
          >
            {status === "submitting"
              ? "Aggiornamento in corso…"
              : "Reimposta password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
