"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type {
  FormMessage,
  QuoteSettingsData,
  SetField,
} from "@/lib/Utility/QuoteSettings/quote-settings.types";
import {
  DEFAULT_SETTINGS,
  SETTINGS_MESSAGES,
} from "@/lib/Utility/QuoteSettings/quote-settings.consts";
import {
  getSaveErrorMessage,
  validateSettings,
} from "@/lib/Utility/QuoteSettings/quote-settings.helper";
import { updateQuoteSettings } from "@/lib/Api/QuoteSettings/quote-settings.client";

// Re-export: le sezioni che importano SectionProps da qui continuano a funzionare
export type {
  SetField,
  SectionProps,
} from "@/lib/Utility/QuoteSettings/quote-settings.types";

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
  const [message, setMessage] = useState<FormMessage>(null);

  // Stabile tra i render (usa l'updater funzionale)
  const set = useCallback<SetField>((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const error = validateSettings(values);
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setSaving(true);
    try {
      await updateQuoteSettings(slug, values);
      router.refresh();
      setMessage({ type: "ok", text: SETTINGS_MESSAGES.saved });
    } catch (err) {
      setMessage({ type: "error", text: getSaveErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return { values, set, saving, message, handleSubmit };
}
