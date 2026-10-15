import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Option } from "@/lib/Consts/CompanySettingsConsts";

/* ---------- Contenitori ---------- */

// Classi scritte per intero: Tailwind non vede quelle costruite dinamicamente.
const COLUMNS = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" } as const;

export function SectionCard({
  title,
  description,
  columns = 2,
  children,
}: {
  title: string;
  description?: ReactNode;
  columns?: 2 | 3;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={`grid gap-4 ${COLUMNS[columns]}`}>{children}</CardContent>
    </Card>
  );
}

export function FormField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

/* ---------- Campi ---------- */

export function NumberField({
  name,
  label,
  value,
  onChange,
  min,
  max,
  step,
  className,
}: {
  name: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: string;
  className?: string;
}) {
  return (
    <FormField label={label} htmlFor={name} className={className}>
      <Input
        id={name}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        // stringa vuota -> 0, la validazione vera è in useSettingsForm
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
    </FormField>
  );
}

/** Testo opzionale: stringa vuota -> null (come si aspetta il backend). Con `rows` diventa una textarea. */
export function TextField({
  name,
  label,
  value,
  onChange,
  rows,
  placeholder,
  className = "sm:col-span-2",
}: {
  name: string;
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
}) {
  const handle = (v: string) => onChange(v.trim() === "" ? null : v);

  return (
    <FormField label={label} htmlFor={name} className={className}>
      {rows ? (
        <Textarea id={name} rows={rows} value={value ?? ""} onChange={(e) => handle(e.target.value)} />
      ) : (
        <Input
          id={name}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => handle(e.target.value)}
        />
      )}
    </FormField>
  );
}

export function SwitchField({
  name,
  label,
  description,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
      <div>
        <Label htmlFor={name}>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={name} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <FormField label={label} className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

const NONE = "__none__"; // Radix Select non accetta value=""

/** Select con voce "nessuna" che corrisponde a null. */
export function NullableSelectField({
  value,
  onChange,
  emptyLabel,
  options,
  ...rest
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  emptyLabel: string;
  options: Option[];
  className?: string;
}) {
  return (
    <SelectField
      {...rest}
      placeholder={emptyLabel}
      value={value ?? NONE}
      onChange={(v) => onChange(v === NONE ? null : v)}
      options={[{ value: NONE, label: emptyLabel }, ...options]}
    />
  );
}