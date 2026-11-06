import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { Option } from "@/lib/Utility/QuoteSettings/quote-settings.consts";

/* ---------- Contenitori ---------- */

// Classi scritte per intero: Tailwind non vede quelle costruite dinamicamente.
const COLUMNS = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" } as const;

export function SectionCard({
  id,
  step,
  eyebrow,
  icon: Icon,
  title,
  description,
  columns = 2,
  children,
}: {
  id: string; // ancora per la navigazione laterale
  step: string; // "01"
  eyebrow: string; // "Stile"
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  columns?: 2 | 3;
  children: ReactNode;
}) {
  return (
    <Card id={id} className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {step} · {eyebrow}
            </p>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className={`grid gap-4 ${COLUMNS[columns]}`}>
        {children}
      </CardContent>
    </Card>
  );
}

/** Indice laterale con scroll alle sezioni. */
export function SectionNav({
  items,
}: {
  items: { id: string; label: string }[];
}) {
  return (
    <nav className="sticky top-24 hidden space-y-1 self-start lg:block">
      {items.map((i) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          className="block rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {i.label}
        </a>
      ))}
    </nav>
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
        onChange={(e) =>
          onChange(e.target.value === "" ? 0 : Number(e.target.value))
        }
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
        <Textarea
          id={name}
          rows={rows}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => handle(e.target.value)}
        />
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

/** Select a larghezza piena. Passa l'etichetta a SelectValue per non mostrare il value tecnico. */
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
  const current = options.find((o) => o.value === value);

  return (
    <FormField label={label} className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}>{current?.label}</SelectValue>
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

/** Colore: picker nativo + campo esadecimale sincronizzati. */
const HEX = /^#[0-9A-Fa-f]{6}$/;

export function ColorField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <FormField label={label} htmlFor={name}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          id={name}
          // <input type="color"> accetta solo #rrggbb: evita warning mentre si digita
          value={HEX.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1"
        />
        <Input
          value={value}
          maxLength={7}
          className="font-mono uppercase"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </FormField>
  );
}
