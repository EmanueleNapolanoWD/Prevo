import { NullableSelectField, NumberField, SectionCard, TextField } from "./Fields";
import { PAYMENT_METHODS } from "@/lib/Consts/CompanySettingsConsts";
import type { SectionProps } from "./useSettingsForm";

export default function TermsSection({ values, set }: SectionProps) {
  return (
    <SectionCard
      title="Condizioni commerciali"
      description="Precompilate in ogni nuovo preventivo, modificabili caso per caso."
    >
      <NumberField
        name="default_validity_days"
        label="Validità (giorni)"
        min={1}
        value={values.default_validity_days}
        onChange={(n) => set("default_validity_days", n)}
      />
      <NullableSelectField
        label="Metodo di pagamento"
        value={values.default_payment_method}
        onChange={(v) => set("default_payment_method", v)}
        emptyLabel="Nessuno"
        options={PAYMENT_METHODS}
      />
      <TextField
        name="default_payment_terms"
        label="Termini di pagamento"
        placeholder="es. 30% alla conferma, saldo a 30 giorni"
        value={values.default_payment_terms}
        onChange={(v) => set("default_payment_terms", v)}
      />
      <TextField
        name="default_notes"
        label="Note"
        rows={3}
        value={values.default_notes}
        onChange={(v) => set("default_notes", v)}
      />
      <TextField
        name="default_terms"
        label="Termini e condizioni"
        rows={5}
        value={values.default_terms}
        onChange={(v) => set("default_terms", v)}
      />
    </SectionCard>
  );
}