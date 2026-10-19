'use client';

import { CirclePlus, X } from 'lucide-react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CONTACTS_LABEL } from '@/lib/Api/Clients/clients.schema';
import { ROW } from './Fields';

type Props = {
  name: 'emails' | 'phones';
  valueKey: 'email' | 'phone';
  label: string;
  placeholder: string;
  addLabel: string;
  inputType?: string;
};

/** Lista di input ripetibili (email, telefoni) con etichetta Lavoro/Privato/Altro. */
export function RepeatableInputs({ name, valueKey, label, placeholder, addLabel, inputType = 'text' }: Props) {
  const { control } = useFormContext();
  // keyName diverso da "id": le righe in update hanno già un loro id dal database
  const { fields, append, remove } = useFieldArray({ control, name, keyName: 'fieldKey' });

  return (
    <div className={ROW}>
      <span className="pt-2.5 text-sm">{label}</span>

      <div className="space-y-2">
        {fields.map((row, i) => (
          <div key={row.fieldKey} className="flex items-start gap-2">
            <Controller
              control={control}
              name={`${name}.${i}.${valueKey}`}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="w-full max-w-[390px] flex-1 gap-1">
                  <Input
                    type={inputType}
                    placeholder={placeholder}
                    aria-label={label}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={control}
              name={`${name}.${i}.label`}
              render={({ field }) => (
                <Field className="w-[116px] shrink-0">
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger aria-label={`Etichetta ${label.toLowerCase()}`} onBlur={field.onBlur}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACTS_LABEL.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Rimuovi ${label.toLowerCase()}`}
                onClick={() => remove(i)}
              >
                <X />
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="font-semibold"
          onClick={() => append({ [valueKey]: '', label: 'Lavoro' })}
        >
          <CirclePlus />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}