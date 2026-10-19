"use client";

import { Button } from "@/components/ui/button";
import type { CompanySettingsData } from "@/types/company";
import LocalizationSection from "./LocalizationSection";
import NumberingSection from "./NumberingSection";
import TaxSection from "./TaxSection";
import TermsSection from "./TermsSection";
import { useSettingsForm } from "./hooks/useSettingsForm";

export default function SettingsForm({
  slug,
  initialValues,
}: {
  slug: string,
  initialValues?: Partial<CompanySettingsData>;
}) {
  const { values, set, saving, message, handleSubmit } = useSettingsForm(slug, initialValues);

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <NumberingSection values={values} set={set} /> ok
      <TaxSection values={values} set={set} /> ok
      <TermsSection values={values} set={set} /> ok
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