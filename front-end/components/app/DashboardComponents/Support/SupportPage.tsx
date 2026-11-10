"use client";

import { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  MailIcon,
  ClockIcon,
  LifeBuoyIcon,
  SendIcon,
  ChevronDownIcon,
} from "@/components/app/DashboardUI/support-icons";
import {
  supportFormSchema,
  type SupportFormValues,
  SUPPORT_SUBJECTS,
  type SupportSubject,
} from "@/components/app/DashboardComponents/Support/support.schema";
import { sendSupportRequest } from "@/components/app/DashboardComponents/Support/support.api";

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "supporto@prevo.it";
const MIN_SUBMIT_INTERVAL_MS = 5000; // protezione invii ripetuti rapidi

export function SupportPage({ userEmail }: { userEmail?: string }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const lastSubmit = useRef(0);

  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      email: userEmail ?? "",
      subject: "other",
      message: "",
    },
    mode: "onTouched",
  });

  const errors = form.formState.errors;

  if (success) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col items-center text-center py-10">
          <LifeBuoyIcon className="size-12 text-prevo-primary" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold">Richiesta inviata</h2>
          <p className="mt-2 text-muted-foreground">
            Grazie. Riceverai una risposta all&apos;indirizzo{" "}
            {form.values.email || userEmail} entro 1-2 giorni lavorativi.
          </p>
        </div>
        <Button
          onClick={() => {
            setSuccess(false);
            form.reset({
              email: userEmail ?? "",
              subject: "other",
              message: "",
            });
          }}
        >
          Nuova richiesta
        </Button>
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Supporto</h1>
        <p className="mt-1 text-muted-foreground">
          Hai bisogno di aiuto? Siamo qui per aiutarti.
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Email diretta */}
        <Card className="col-span-1 md:col-span-1 lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="flex items-center justify-center size-8 rounded-lg bg-prevo-bg text-prevo-primary">
              <MailIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base">Email diretta</CardTitle>
              <CardDescription>
                Scrivi all&apos;assistenza di Prevo.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed">{SUPPORT_EMAIL}</p>
          </CardContent>
        </Card>

        {/* Tempi di risposta */}
        <Card className="col-span-1 md:col-span-1 lg:col-span-1">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="flex items-center justify-center size-8 rounded-lg bg-prevo-bg text-prevo-primary">
              <ClockIcon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base">Tempi di risposta</CardTitle>
              <CardDescription>
                Quanto attendere per una risposta.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm font-medium">1–2 giorni lavorativi</p>
          </CardContent>
        </Card>

        {/* Argomenti */}
        <Card className="col-span-2 md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              Di cosa possiamo aiutarti?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="grid gap-3 md:grid-cols-2">
              {SUPPORT_SUBJECTS.map((item) => (
                <li
                  key={item.value}
                  className="flex items-center gap-3 rounded-lg border border-input bg-background p-3 hover:bg-muted/50 transition-colors"
                >
                  <LifeBuoyIcon
                    className="size-4 text-muted-foreground shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-sm">{item.label}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Form contatto */}
        <Card className="col-span-2 md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              Scrivici un messaggio
            </CardTitle>
            <CardDescription>
              Compila il modulo e ti risponderemo via email, di solito entro
              1-2 giorni lavorativi.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form
              onSubmit={(values: SupportFormValues) => {
                const now = Date.now();
                if (now - lastSubmit.current < MIN_SUBMIT_INTERVAL_MS) {
                  return;
                }
                lastSubmit.current = now;

                form.clearErrors("root.server");

                startTransition(async () => {
                  const result = await sendSupportRequest(values);

                  if (result.ok) {
                    setSuccess(true);
                    toast.success("Richiesta inviata", {
                      description:
                        "Ti risponderemo via email entro 1-2 giorni lavorativi.",
                    });
                    return;
                  }

                  Object.entries(result.errors ?? {}).forEach(
                    ([path, messages]) => {
                      form.setError(path as keyof SupportFormValues, {
                        type: "server",
                        message: messages[0],
                      });
                    }
                  );

                  form.setError("root.server", {
                    type: "server",
                    message:
                      result.message ??
                      "Invio non riuscito. Controlla i campi evidenziati e riprova.",
                  });
                });
              }}
              className="space-y-5"
              noValidate
            >
              <div className="grid gap-4 md:grid-cols-2">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="support-email">Email</Label>
                  <Input
                    id="support-email"
                    {...form.register("email")}
                    disabled={isPending}
                    placeholder="nome@dominio.it"
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? "support-email-error" : undefined
                    }
                    className={cn(
                      errors.email ? "border-destructive" : undefined
                    )}
                  />
                  {errors.email && (
                    <p
                      id="support-email-error"
                      className="text-destructive text-xs"
                      role="alert"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Argomento */}
                <div className="space-y-2">
                  <Label htmlFor="support-subject">Argomento</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("subject", value as SupportSubject)
                    }
                    defaultValue={form.getValues("subject")}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="support-subject"
                      aria-invalid={!!errors.subject}
                      aria-describedby={
                        errors.subject
                          ? "support-subject-error"
                          : undefined
                      }
                      className={cn(
                        "pr-10",
                        errors.subject ? "border-destructive" : undefined
                      )}
                    >
                      <SelectValue placeholder="Seleziona un argomento" />
                      <span
                        className="pointer-events-none absolute right-3 flex size-4 items-center justify-center text-muted-foreground"
                        aria-hidden="true"
                      >
                        <ChevronDownIcon className="size-4" />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Argomento</SelectLabel>
                        {SUPPORT_SUBJECTS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p
                      id="support-subject-error"
                      className="text-destructive text-xs"
                      role="alert"
                    >
                      {errors.subject.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-message">Messaggio</Label>
                <Textarea
                  id="support-message"
                  {...form.register("message")}
                  disabled={isPending}
                  rows={6}
                  placeholder="Descrivi il problema o la tua richiesta in modo dettagliato..."
                  aria-invalid={!!errors.message}
                  aria-describedby={
                    errors.message ? "support-message-error" : undefined
                  }
                  className={cn(
                    errors.message ? "border-destructive" : undefined
                  )}
                />
                {errors.message && (
                  <p
                    id="support-message-error"
                    className="text-destructive text-xs"
                    role="alert"
                  >
                    {errors.message.message}
                  </p>
                )}
              </div>

              {errors.root?.server && (
                <Alert variant="destructive">
                  <AlertTitle>Invio non riuscito</AlertTitle>
                  <AlertDescription>{errors.root.server.message}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                variant="default"
                className="w-full md:w-auto"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <SendIcon
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Invio in corso...
                  </>
                ) : (
                  <>
                    <SendIcon className="size-4" aria-hidden="true" />
                    Invia richiesta
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

