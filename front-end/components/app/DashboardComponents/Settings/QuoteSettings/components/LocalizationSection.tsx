import { Globe } from "lucide-react";
import {
  DATE_FORMATS,
  LOCALES,
  TIMEZONES,
} from "@/lib/Utility/QuoteSettings/quote-settings.consts";
import type { SectionProps } from "../hooks/useSettingsForm";
import { SectionCard, SelectField } from "./Fields";

export default function LocalizationSection({ values, set }: SectionProps) {
  return (
    <SectionCard
      id="localizzazione"
      step="05"
      eyebrow="Regionale"
      icon={Globe}
      title="Localizzazione"
      description="Lingua, fuso orario e formato delle date nei documenti."
      columns={3}
    >
      <SelectField
        label="Lingua"
        value={values.locale}
        onChange={(v) => set("locale", v)}
        options={LOCALES}
      />
      <SelectField
        label="Fuso orario"
        value={values.timezone}
        onChange={(v) => set("timezone", v)}
        options={TIMEZONES}
      />
      <SelectField
        label="Formato data"
        value={values.date_format}
        onChange={(v) => set("date_format", v)}
        options={DATE_FORMATS}
      />
    </SectionCard>
  );
}
