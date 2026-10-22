"use client";

import { Button } from "@/components/ui/button";
import type { QuoteSettingsData } from "@/types/quote";
import LocalizationSection from "./components/LocalizationSection";
import NumberingSection from "./components/NumberingSection";
import TaxSection from "./components/TaxSection";
import TermsSection from "./components/TermsSection";
import { useSettingsForm } from "./hooks/useSettingsForm";

export default function SettingsForm({
  slug,
  initialValues,
}: {
  slug: string,
  initialValues?: Partial<QuoteSettingsData>;
}) {
  const { values, set, saving, message, handleSubmit } = useSettingsForm(slug, initialValues);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <NumberingSection values={values} set={set} /> 
      <TaxSection values={values} set={set} /> 
      <TermsSection values={values} set={set} /> 
      <LocalizationSection values={values} set={set} />

      <div className="flex items-center justify-end gap-4">
        {message && (
          <p
            role="status"
            className={message.type === "ok" ? "text-sm text-green-600" : "text-sm text-destructive"}
          >
            {message.text}
          </p>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? "Salvataggio…" : "Salva impostazioni"}
        </Button>
      </div>
    </form>
  );
}