"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import type { QuoteSettingsData } from "@/types/quote";
import { updateCompanySettings } from "@/lib/Api/Company/company.client";
import { DEFAULT_SETTINGS } from "@/lib/Consts/CompanySettingsConsts";

export type SetField = <K extends keyof QuoteSettingsData>(
  key: K,
  value: QuoteSettingsData[K],
) => void;

/** Props comuni a tutte le sezioni del form. */
export type SectionProps = {
  values: QuoteSettingsData;
  set: SetField;
};

type Message = { type: "ok" | "error"; text: string } | null;

function validate(v: QuoteSettingsData): string | null {
  if (!v.quote_prefix.trim())
    return "Il prefisso dei preventivi è obbligatorio.";
  if (v.quote_start_number < 1)
    return "Il numero iniziale deve essere almeno 1.";
  if (v.next_quote_number < 1)
    return "Il prossimo numero deve essere almeno 1.";
  if (v.quote_number_padding < 1 || v.quote_number_padding > 10)
    return "Le cifre del numero devono essere tra 1 e 10.";
  if (v.default_vat_rate < 0 || v.default_vat_rate > 100)
    return "L'aliquota IVA deve essere tra 0 e 100.";
  if (v.default_validity_days < 1)
    return "La validità deve essere di almeno 1 giorno.";
  return null;
}

/** Primo messaggio di validazione di Laravel (422), altrimenti un messaggio generico. */
function getErrorMessage(err: unknown): string {
  if (isAxiosError(err) && err.response?.status === 422) {
    const first = Object.values(err.response.data.errors ?? {})[0] as
      | string[]
      | undefined;
    return first?.[0] ?? "Dati non validi.";
  }
  return "Salvataggio non riuscito. Riprova.";
}

export function useSettingsForm(
  slug: string,
  initialValues?: Partial<QuoteSettingsData>,
) {
  const router = useRouter();
  const [values, setValues] = useState<QuoteSettingsData>({
    ...DEFAULT_SETTINGS,
    ...initialValues,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const set: SetField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const error = validate(values);

    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setSaving(true);
    try {
      await updateCompanySettings(slug, values);
      router.refresh();
      setMessage({ type: "ok", text: "Impostazioni salvate!" });
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return { values, set, saving, message, handleSubmit };
}
