import z from "zod";
import type { Product, ProductPayload } from "@/types/product";

// COSTANTI (devono coincidere con l'enum PHP ProductUnit)
export const UNIT_VALUES = ["pz", "m", "m2", "m3", "kg", "l", "h", "gg", "forfait"] as const;

export const PRODUCT_UNITS: { value: (typeof UNIT_VALUES)[number]; label: string }[] = [
  { value: "pz", label: "Pezzo (pz)" },
  { value: "m", label: "Metro (m)" },
  { value: "m2", label: "Metro quadro (m²)" },
  { value: "m3", label: "Metro cubo (m³)" },
  { value: "kg", label: "Chilogrammo (kg)" },
  { value: "l", label: "Litro (l)" },
  { value: "h", label: "Ora (h)" },
  { value: "gg", label: "Giorno (gg)" },
  { value: "forfait", label: "A corpo" },
];

export const VAT_RATES = ["22", "10", "5", "4", "0"] as const;

// HELPER
const isBlank = (v?: string | null) => !v || v.trim() === "";

/** "1.200,50" -> 1200.5 | "12,5" -> 12.5 | "12.5" -> 12.5 | non valido -> NaN */
export function parseDecimal(value: string): number {
  const v = value.trim();
  if (v === "") return NaN;
  const normalized = v.includes(",") ? v.replace(/\./g, "").replace(",", ".") : v;
  return /^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
}

const hasMaxTwoDecimals = (n: number) => Math.abs(Math.round(n * 100) - n * 100) < 1e-6;

const text = (max: number) => z.string().trim().max(max, `Massimo ${max} caratteri`);

// SCHEMA
export const productFormSchema = z
  .object({
    code: text(100),
    name: z.string().trim().min(1, "Inserisci il nome del prodotto").max(255, "Massimo 255 caratteri"),
    category_id: z.string(), // "" = nessuna categoria
    unit: z.enum(UNIT_VALUES, { message: "Seleziona l'unità di misura" }),
    description: text(5000),
    sale_price: z.string().trim(),
    cost_price: z.string().trim(),
    vat_rate: z.string().trim(),
    is_active: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    // Prezzo di vendita: obbligatorio
    const sale = parseDecimal(v.sale_price);
    if (isBlank(v.sale_price)) issue("sale_price", "Inserisci il prezzo di vendita");
    else if (Number.isNaN(sale)) issue("sale_price", "Il prezzo di vendita non è valido");
    else if (sale < 0) issue("sale_price", "Il prezzo non può essere negativo");
    else if (!hasMaxTwoDecimals(sale)) issue("sale_price", "Massimo 2 decimali");
    else if (sale > 9_999_999_999.99) issue("sale_price", "Importo troppo alto");

    // Prezzo di acquisto: facoltativo, ma se compilato deve essere valido
    if (!isBlank(v.cost_price)) {
      const cost = parseDecimal(v.cost_price);
      if (Number.isNaN(cost)) issue("cost_price", "Il prezzo di acquisto non è valido");
      else if (cost < 0) issue("cost_price", "Il prezzo non può essere negativo");
      else if (!hasMaxTwoDecimals(cost)) issue("cost_price", "Massimo 2 decimali");
    }

    // IVA: obbligatoria, 0-100
    const vat = parseDecimal(v.vat_rate);
    if (isBlank(v.vat_rate)) issue("vat_rate", "Inserisci l'aliquota IVA");
    else if (Number.isNaN(vat) || vat < 0 || vat > 100)
      issue("vat_rate", "L'aliquota deve essere compresa tra 0 e 100");
    else if (!hasMaxTwoDecimals(vat)) issue("vat_rate", "Massimo 2 decimali");
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const productFormDefaults: ProductFormValues = {
  code: "",
  name: "",
  category_id: "",
  unit: "pz",
  description: "",
  sale_price: "",
  cost_price: "",
  vat_rate: "22",
  is_active: true,
};

// FORM -> PAYLOAD API
const orNull = (v: string) => (isBlank(v) ? null : v.trim());

export function toProductPayload(v: ProductFormValues): ProductPayload {
  return {
    category_id: orNull(v.category_id),
    code: orNull(v.code),
    name: v.name.trim(),
    description: orNull(v.description),
    unit: v.unit,
    sale_price: parseDecimal(v.sale_price),
    cost_price: isBlank(v.cost_price) ? null : parseDecimal(v.cost_price),
    vat_rate: parseDecimal(v.vat_rate),
    is_active: v.is_active,
  };
}

// RISORSA API -> FORM (modalità update)
const toItalianDecimal = (value: string | number | null) =>
  value === null || value === "" ? "" : Number(value).toFixed(2).replace(".", ",");

export function toFormValues(p: Product): ProductFormValues {
  return {
    code: p.code ?? "",
    name: p.name,
    category_id: p.category_id ?? "",
    unit: (UNIT_VALUES as readonly string[]).includes(p.unit)
      ? (p.unit as ProductFormValues["unit"])
      : "pz",
    description: p.description ?? "",
    sale_price: toItalianDecimal(p.sale_price),
    cost_price: toItalianDecimal(p.cost_price),
    vat_rate: String(Number(p.vat_rate)),
    is_active: p.is_active,
  };
}

/** Prezzo lordo per l'anteprima nella sidebar. */
export function grossPrice(salePrice: string, vatRate: string): number {
  const sale = parseDecimal(salePrice);
  const vat = parseDecimal(vatRate);
  if (Number.isNaN(sale)) return 0;
  return sale * (1 + (Number.isNaN(vat) ? 0 : vat) / 100);
}