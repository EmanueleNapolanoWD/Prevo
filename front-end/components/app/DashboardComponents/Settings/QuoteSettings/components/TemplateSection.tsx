import { Palette } from "lucide-react";
import { QUOTE_TEMPLATES } from "@/lib/Utility/QuoteSettings/quote-settings.consts";
import type { SectionProps } from "../hooks/useSettingsForm";
import { ColorField, SectionCard, SelectField } from "./Fields";

export default function TemplateSection({ values, set }: SectionProps) {
  return (
    <SectionCard
      id="template"
      step="01"
      eyebrow="Stile"
      icon={Palette}
      title="Template e colori"
      description="Aspetto dei preventivi generati in PDF e nelle pagine pubbliche."
    >
      <SelectField
        label="Template"
        className="sm:col-span-2"
        value={values.default_quote_template}
        onChange={(v) => set("default_quote_template", v)}
        options={QUOTE_TEMPLATES}
      />
      <ColorField
        name="quote_primary_color"
        label="Colore primario"
        value={values.quote_primary_color}
        onChange={(v) => set("quote_primary_color", v)}
      />
      <ColorField
        name="quote_accent_color"
        label="Colore accento"
        value={values.quote_accent_color}
        onChange={(v) => set("quote_accent_color", v)}
      />

      {/* Mini anteprima
      <div className="overflow-hidden rounded-lg border sm:col-span-2">
        <div
          className="px-4 py-3 text-sm font-semibold text-white"
          style={{ background: values.quote_primary_color }}
        >
          Preventivo {values.quote_prefix || "PREV"}
        </div>
        <div className="space-y-2 p-4">
          <div className="h-2 w-2/3 rounded bg-muted" />
          <div className="h-2 w-1/2 rounded bg-muted" />
          <div
            className="mt-3 inline-block rounded px-3 py-1 text-xs font-medium text-white"
            style={{ background: values.quote_accent_color }}
          >
            Totale
          </div>
        </div>
      </div> */}
    </SectionCard>
  );
}
