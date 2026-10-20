"use client";

import { useState, useTransition } from "react";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productFormDefaults,
  productFormSchema,
  toProductPayload,
  type ProductFormValues,
} from "@/lib/Api/Product/product.schema";
import type { ApiError } from "@/lib/Api/Services/action.helpers";
import type { ProductPayload } from "@/types/product";

type Options = {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (payload: ProductPayload) => Promise<ApiError | void>;
};

export function useProductForm({ defaultValues, onSubmit }: Options) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { ...productFormDefaults, ...defaultValues },
    mode: "onTouched",
  });

  const submit = form.handleSubmit((values) => {
    setServerError(null);

    startTransition(async () => {
      // In caso di successo l'action fa redirect e la promise non torna qui
      const result = await onSubmit(toProductPayload(values));
      if (!result) return;

      setServerError(result.message);

      // Errori di validazione del backend, mappati sui campi (i nomi coincidono)
      for (const [field, messages] of Object.entries(result.errors ?? {})) {
        form.setError(field as Path<ProductFormValues>, {
          type: "server",
          message: messages[0],
        });
      }
    });
  });

  return { form, submit, isPending, serverError };
}