"use client";

import Link from "next/link";
import { useWatch } from "react-hook-form";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Loader2,
  Package,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PRODUCT_UNITS,
  grossPrice,
  type ProductFormValues,
} from "@/lib/Api/Product/product.schema";
import type { ApiError } from "@/lib/Api/Services/action.helpers";
import type { ProductPayload } from "@/types/product";
import { useProductForm } from "./useProductForm";

export type CategoryOption = { id: string; name: string };

type Props = {
  mode: "create" | "update";
  slug: string;
  /** In update: toFormValues(product). Passa anche key={product.id}. */
  defaultValues?: Partial<ProductFormValues>;
  categories?: CategoryOption[];
  onSubmit: (payload: ProductPayload) => Promise<ApiError | void>;
};

const INPUT =
  "h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive";

function Field({
  id,
  label,
  required,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}{" "}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
        {optional && (
          <span className="font-normal text-muted-foreground">Opzionale</span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function ProductForm({
  mode,
  slug,
  defaultValues,
  categories = [],
  onSubmit,
}: Props) {
  const isCreate = mode === "create";
  const backHref = `/${slug}/products`;

  const { form, submit, isPending, serverError } = useProductForm({
    defaultValues,
    onSubmit,
  });
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = form;

  const [salePrice, vatRate, isActive] = useWatch({
    control,
    name: ["sale_price", "vat_rate", "is_active"],
  });
  const total = grossPrice(salePrice ?? "", vatRate ?? "");

  const describe = (name: keyof ProductFormValues) => ({
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <Link
            href={backHref}
            aria-label="Torna ai prodotti"
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-background hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              Catalogo prodotti
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {isCreate ? "Nuovo prodotto" : "Modifica prodotto"}
            </h1>
          </div>
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="grid gap-6 lg:grid-cols-[1fr_280px]"
        >
          <div className="rounded-xl border bg-background shadow-sm">
            {/* INFORMAZIONI */}
            <div className="border-b px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Informazioni prodotto</h2>
                  <p className="text-sm text-muted-foreground">
                    Inserisci i dati principali del prodotto o servizio.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 px-6 py-6 sm:px-8">
              {serverError && (
                <p
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {serverError}
                </p>
              )}

              <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
                <Field
                  id="code"
                  label="Codice"
                  optional
                  error={errors.code?.message}
                >
                  <input
                    id="code"
                    placeholder="Es. PROD-001"
                    className={INPUT}
                    {...describe("code")}
                    {...register("code")}
                  />
                </Field>
                <Field
                  id="name"
                  label="Nome prodotto"
                  required
                  error={errors.name?.message}
                >
                  <input
                    id="name"
                    placeholder="Es. Consulenza strategica"
                    className={INPUT}
                    {...describe("name")}
                    {...register("name")}
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="category_id"
                  label="Categoria"
                  optional
                  error={errors.category_id?.message}
                >
                  <div className="relative">
                    <select
                      id="category_id"
                      className={`${INPUT} appearance-none`}
                      {...describe("category_id")}
                      {...register("category_id")}
                    >
                      <option value="">Nessuna categoria</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground"
                    />
                  </div>
                </Field>

                <Field
                  id="unit"
                  label="Unità di misura"
                  required
                  error={errors.unit?.message}
                >
                  <div className="relative">
                    <select
                      id="unit"
                      className={`${INPUT} appearance-none`}
                      {...describe("unit")}
                      {...register("unit")}
                    >
                      {PRODUCT_UNITS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-3 size-4 text-muted-foreground"
                    />
                  </div>
                </Field>
              </div>

              <Field
                id="description"
                label="Descrizione"
                optional
                error={errors.description?.message}
              >
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Aggiungi una descrizione utile per i tuoi documenti..."
                  className={`${INPUT} h-auto resize-none py-2`}
                  {...describe("description")}
                  {...register("description")}
                />
              </Field>
            </div>

            {/* PREZZI */}
            <div className="border-t px-6 py-5 sm:px-8">
              <h2 className="font-semibold">Prezzi e imposte</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Definisci i valori applicati nelle vendite e negli acquisti.
              </p>
            </div>

            <div className="grid gap-5 px-6 pb-8 sm:grid-cols-3 sm:px-8">
              <Field
                id="sale_price"
                label="Prezzo di vendita"
                required
                error={errors.sale_price?.message}
              >
                <div className="relative">
                  <input
                    id="sale_price"
                    inputMode="decimal"
                    placeholder="0,00"
                    className={`${INPUT} pr-10`}
                    {...describe("sale_price")}
                    {...register("sale_price")}
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                    €
                  </span>
                </div>
              </Field>

              <Field
                id="cost_price"
                label="Prezzo di acquisto"
                optional
                error={errors.cost_price?.message}
              >
                <div className="relative">
                  <input
                    id="cost_price"
                    inputMode="decimal"
                    placeholder="0,00"
                    className={`${INPUT} pr-10`}
                    {...describe("cost_price")}
                    {...register("cost_price")}
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                    €
                  </span>
                </div>
              </Field>

              <Field
                id="vat_rate"
                label="Aliquota IVA"
                required
                error={errors.vat_rate?.message}
              >
                <div className="relative">
                  <input
                    id="vat_rate"
                    inputMode="decimal"
                    list="vat-rates"
                    className={`${INPUT} pr-10`}
                    {...describe("vat_rate")}
                    {...register("vat_rate")}
                  />
                  <datalist id="vat-rates">
                    {["22", "10", "5", "4", "0"].map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </Field>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
              <Button
                type="button"
                variant="outline"
                render={<Link href={backHref} />}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save data-icon="inline-start" />
                )}
                {isCreate ? "Crea prodotto" : "Salva modifiche"}
              </Button>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <h2 className="font-semibold">Stato</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Gestisci la visibilità nel catalogo.
              </p>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() =>
                  setValue("is_active", !isActive, { shouldDirty: true })
                }
                className="mt-5 flex w-full items-center justify-between rounded-lg border p-3 text-left transition hover:bg-muted/50"
              >
                <span>
                  <span className="block text-sm font-medium">
                    Prodotto attivo
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Visibile nei nuovi documenti
                  </span>
                </span>
                <span
                  className={`flex size-6 items-center justify-center rounded-full border ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {isActive && <Check className="size-4" />}
                </span>
              </button>
            </div>

            <div className="rounded-xl border bg-primary p-5 text-primary-foreground shadow-sm">
              <p className="text-sm opacity-80">Prezzo lordo stimato</p>
              <p className="mt-2 text-3xl font-semibold">
                {total.toLocaleString("it-IT", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
              <p className="mt-1 text-xs opacity-70">
                Inclusa IVA al {vatRate || "0"}%
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
