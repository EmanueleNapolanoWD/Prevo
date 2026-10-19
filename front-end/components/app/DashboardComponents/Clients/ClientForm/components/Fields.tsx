'use client';

import { useId, type ComponentProps, type ReactNode } from 'react';
import { Info } from 'lucide-react';
import { Controller, useFormContext, type ControllerRenderProps, type FieldValues } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

/** Griglia etichetta (143px) + campo, come nel design. Sotto sm le etichette vanno sopra. */
export const ROW = 'grid grid-cols-1 items-start gap-1 sm:grid-cols-[143px_minmax(0,1fr)] sm:gap-2';
export const CONTROL = 'w-full max-w-[390px]';

// I campi usano i nomi come stringhe ("addresses.0.street"), quindi qui il form è tipizzato in modo largo.
type RenderField = ControllerRenderProps<FieldValues, string>;
type FieldMeta = { id: string; invalid: boolean };

export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-b py-5 last:border-b-0">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        {title}
        {hint && (
          <span title={hint}>
            <Info className="size-4 text-blue-600" aria-label={hint} />
          </span>
        )}
      </h2>
      {children}
    </section>
  );
}

/** Riga etichetta + controllo + errore, collegata a react-hook-form con Controller. */
export function FieldRow({
  name,
  label,
  children,
}: {
  name: string;
  label: string;
  children: (field: RenderField, meta: FieldMeta) => ReactNode;
}) {
  const { control } = useFormContext();
  const baseId = useId();
  const id = `${baseId}-${name}`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={ROW}>
          <FieldLabel htmlFor={id} className="pt-2.5 font-normal">
            {label}
          </FieldLabel>
          <Field data-invalid={fieldState.invalid} className="gap-1">
            {children(field, { id, invalid: fieldState.invalid })}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        </div>
      )}
    />
  );
}

export function TextField({
  name,
  label,
  ...props
}: { name: string; label: string } & Omit<ComponentProps<'input'>, 'name' | 'value' | 'onChange'>) {
  return (
    <FieldRow name={name} label={label}>
      {(field, { id, invalid }) => (
        <Input id={id} aria-invalid={invalid} {...props} {...field} className={`${CONTROL} ${props.className ?? ''}`} />
      )}
    </FieldRow>
  );
}

export function TextareaField({
  name,
  label,
  ...props
}: { name: string; label: string } & Omit<ComponentProps<'textarea'>, 'name' | 'value' | 'onChange'>) {
  return (
    <FieldRow name={name} label={label}>
      {(field, { id, invalid }) => (
        <Textarea id={id} aria-invalid={invalid} className={`${CONTROL} min-h-14`} {...props} {...field} />
      )}
    </FieldRow>
  );
}

// Radix non accetta value="" su SelectItem: la voce "nessuno" usa un valore sentinella
const NONE = '__none__';

export function SelectField({
  name,
  label,
  options,
  placeholder,
  clearLabel,
}: {
  name: string;
  label: string;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
  /** Se presente, aggiunge una voce per svuotare la selezione */
  clearLabel?: string;
}) {
  return (
    <FieldRow name={name} label={label}>
      {(field, { id, invalid }) => (
        <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v === NONE ? '' : v)}>
          <SelectTrigger id={id} aria-invalid={invalid} onBlur={field.onBlur} className={CONTROL}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {clearLabel && <SelectItem value={NONE}>{clearLabel}</SelectItem>}
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldRow>
  );
}

export function SwitchField({ name, label }: { name: string; label: string }) {
  return (
    <FieldRow name={name} label={label}>
      {(field, { id }) => <Switch id={id} checked={!!field.value} onCheckedChange={field.onChange} />}
    </FieldRow>
  );
}