"use client";

import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormProvider } from "react-hook-form";
import { AddressesSection } from "./components/AddressesSection";
import { DescriptionSection } from "./components/DescriptionSection";
import { GeneralSection, type ClientGroup } from "./components/GeneralSection";
import { PaymentSection } from "./components/PaymentSection";
import { TaxSection } from "./components/TaxSection";
import type {
  ClientFormValues,
  ClientPayload,
} from "@/lib/Utility/Clients/clients.schema";
import { useClientForm, type ClientActionResult } from "./hooks/useClientForm";
import styles from "./clients-form.module.css";

type Props = {
  mode: "create" | "update";
  /** In update: toFormValues(client). Passa anche key={client.id} per reinizializzare il form. */
  defaultValues?: Partial<ClientFormValues>;
  groups?: ClientGroup[];
  onSubmit: (payload: ClientPayload) => Promise<ClientActionResult>;
  onSuccess?: () => void;
};

export default function ClientForm({
  mode,
  defaultValues,
  groups = [],
  onSubmit,
  onSuccess,
}: Props) {
  const { form, submit, isPending, serverError } = useClientForm({
    defaultValues,
    onSubmit,
    onSuccess,
  });
  const isCreate = mode === "create";

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className={styles.form}>
        <GeneralSection groups={groups} />
        <DescriptionSection />
        <AddressesSection />
        <PaymentSection />
        <TaxSection />

        <div className={styles.saveBar}>
          {serverError && (
            <p role="alert" className={styles.barError}>
              {serverError}
            </p>
          )}

          <Button type="submit" className={styles.primary} disabled={isPending}>
            {isPending ? (
              <Loader2 className={styles.spin} aria-hidden="true" />
            ) : (
              <Save aria-hidden="true" />
            )}
            {isCreate ? "Crea Contatto" : "Salva Modifiche"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
