import { SectionCard, SelectField } from "./Fields";
import { DATE_FORMATS, LOCALES, TIMEZONES } from "@/lib/Consts/CompanySettingsConsts";
import type { SectionProps } from "./useSettingsForm";

export default function LocalizationSection({ values, set }: SectionProps) {
  return (
    <SectionCard title="Localizzazione" columns={3}>
      <SelectField label="Lingua" value={values.locale} onChange={(v) => set("locale", v)} options={LOCALES} />
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