import { useState, useEffect } from "react";
import { getQuoteSettingsAction } from "@/lib/Api/QuoteSettings/quote-settings.action";
import type { QuoteSettingsData } from "@/lib/Utility/QuoteSettings/quote-settings.types";
import { SETTINGS_ERROR } from "@/lib/Utility/Quote/quote.consts";

// Carica le impostazioni preventivi dell'azienda (default del form)
export function useQuoteSettings(slug: string) {
  const [settings, setSettings] = useState<QuoteSettingsData | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setSettingsLoading(true);
      setSettingsError(null);

      try {
        const res = await getQuoteSettingsAction(slug);
        if (!cancelled) setSettings(res);
      } catch {
        if (!cancelled) {
          setSettings(null);
          setSettingsError(SETTINGS_ERROR);
        }
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);
  return { settings, settingsLoading, settingsError };
}
