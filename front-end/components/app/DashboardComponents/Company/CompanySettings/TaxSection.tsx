import { NullableSelectField, NumberField, SectionCard, SelectField, SwitchField } from "./Fields";
import { CURRENCIES, VAT_NATURES } from "@/lib/Consts/CompanySettingsConsts";
import type { SectionProps } from "./useSettingsForm";

export default function TaxSection({ values, set }: SectionProps) {
  return (
    <SectionCard title="Fiscale e importi" description="Valori predefiniti applicati ai nuovi preventivi.">
      <NumberField
        name="default_vat_rate"
        label="Aliquota IVA (%)"
        min={0}
        max={100}
        step="0.01"
        value={values.default_vat_rate}
        onChange={(n) => set("default_vat_rate", n)}
      />
      <SelectField
        label="Valuta"
        value={values.default_currency}
        onChange={(v) => set("default_currency", v)}
        options={CURRENCIES}
      />
      <NullableSelectField
        label="Natura IVA (per aliquota 0%)"
        className="sm:col-span-2"
        value={values.default_vat_nature}
        onChange={(v) => set("default_vat_nature", v)}
        emptyLabel="Nessuna"
        options={VAT_NATURES}
      />
      <SwitchField
        name="prices_include_vat"
        label="Prezzi IVA inclusa"
        description="Gli importi inseriti nelle righe sono considerati già comprensivi di IVA."
        checked={values.prices_include_vat}
        onChange={(v) => set("prices_include_vat", v)}
      />
      <SwitchField
        name="stamp_duty_enabled"
        label="Imposta di bollo"
        description="Aggiunge il bollo ai documenti dove previsto."
        checked={values.stamp_duty_enabled}
        onChange={(v) => set("stamp_duty_enabled", v)}
      />
    </SectionCard>
  );
}