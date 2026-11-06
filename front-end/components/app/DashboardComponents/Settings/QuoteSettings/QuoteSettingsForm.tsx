"use client";

import type { QuoteSettingsData } from "@/lib/Utility/QuoteSettings/quote-settings.types";
import { SETTINGS_NAV } from "@/lib/Utility/QuoteSettings/quote-settings.consts";
import { SectionNav } from "./components/Fields";
import LocalizationSection from "./components/LocalizationSection";
import NumberingSection from "./components/NumberingSection";
import QuotePreviewPanel from "./components/QuotePreviewPanel";
import SettingsSaveBar from "./components/SettingsSaveBar";
import TaxSection from "./components/TaxSection";
import TemplateSection from "./components/TemplateSection";
import TermsSection from "./components/TermsSection";
import { useSettingsForm } from "./hooks/useSettingsForm";

export default function QuoteSettingsForm({
  slug,
  initialValues,
}: {
  slug: string;
  initialValues?: Partial<QuoteSettingsData>;
}) {
  const { values, set, saving, message, handleSubmit } = useSettingsForm(
    slug,
    initialValues,
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[160px_minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[160px_minmax(0,640px)_minmax(0,1fr)]"
    >
      <SectionNav items={SETTINGS_NAV} />

      <div className="min-w-0 space-y-6">
        <TemplateSection values={values} set={set} />
        <NumberingSection values={values} set={set} />
        <TaxSection values={values} set={set} />
        <TermsSection values={values} set={set} />
        <LocalizationSection values={values} set={set} />
        <SettingsSaveBar saving={saving} message={message} />
      </div>

      <QuotePreviewPanel values={values} />
    </form>
  );
}
