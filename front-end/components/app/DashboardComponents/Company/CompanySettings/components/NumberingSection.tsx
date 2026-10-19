import { Input } from "@/components/ui/input";
import { FormField, NumberField, SectionCard, SwitchField } from "./Fields";
import type { SectionProps } from "./useSettingsForm";

export default function NumberingSection({ values, set }: SectionProps) {
  // Anteprima del numero preventivo
  const preview =
    values.quote_prefix.trim().toUpperCase() +
    (values.quote_number_resets_yearly ? `-${new Date().getFullYear()}` : "") +
    `-${String(values.next_quote_number).padStart(values.quote_number_padding, "0")}`;

  return (
    <SectionCard
      title="Numerazione preventivi"
      description={
        <>
          Anteprima prossimo preventivo: <span className="font-mono font-medium">{preview}</span>
        </>
      }
    >
      <FormField label="Prefisso" htmlFor="quote_prefix">
        <Input
          id="quote_prefix"
          maxLength={10}
          value={values.quote_prefix}
          onChange={(e) => set("quote_prefix", e.target.value)}
        />
      </FormField>  
     
      <NumberField
        name="quote_number_padding"
        label="Cifre del numero"
        min={1}
        max={10}
        value={values.quote_number_padding}
        onChange={(n) => set("quote_number_padding", n)}
      />  
      <NumberField
        name="quote_start_number"
        label="Numero iniziale"
        min={1}
        value={values.quote_start_number}
        onChange={(n) => set("quote_start_number", n)}
      /> 
      <NumberField
        name="next_quote_number"
        label="Prossimo numero"
        min={1}
        value={values.next_quote_number}
        onChange={(n) => set("next_quote_number", n)}
      /> 
      <SwitchField
        name="quote_number_resets_yearly"
        label="Azzera ogni anno"
        description="La numerazione riparte dal numero iniziale a ogni nuovo anno."
        checked={values.quote_number_resets_yearly}
        onChange={(v) => set("quote_number_resets_yearly", v)}
      /> 
    </SectionCard>
  );
}