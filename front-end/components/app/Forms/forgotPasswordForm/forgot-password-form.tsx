"use client";

import { type FormEvent, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/lib/Api/auth";

type Status = "idle" | "submitting" | "sent" | "error";


export default function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return; // evita doppi invii

    setStatus("submitting");
    try {
      await forgotPassword(email);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        {status === "sent" ? (
          <CardHeader role="status" aria-live="polite">
            <CardTitle className="text-2xl">Controlla la tua email</CardTitle>
            <CardDescription>
              Se esiste un account associato a {email}, riceverai un link per
              reimpostare la password.
            </CardDescription>
          </CardHeader>
        ) : (
          <>
            <CardHeader>
              <h1 className="text-2xl font-semibold tracking-tight">
                Recupera la password
              </h1>
              <CardDescription>
                Inserisci l&apos;email del tuo account. Ti invieremo un link per
                crearne una nuova.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nome@azienda.it"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === "submitting"}
                      required
                    />
                  </Field>
                </FieldGroup>

                {status === "error" && (
                  <p role="alert" className="text-sm text-destructive">
                    Non siamo riusciti a inviare la richiesta. Riprova tra
                    qualche istante.
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Invio in corso…" : "Invia il link"}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}