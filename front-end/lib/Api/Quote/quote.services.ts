import { centsToEuros, eurosToCents } from "@/lib/utils";

/** Campi di riga usati dal calcolo (QuoteItem li soddisfa strutturalmente). */
export interface CalcItemInput {
  quantity: number | string;
  unit_price: number | string; // euro
  discount_type?: string | null; // "percentage" | "fixed"
  discount_value?: number | string | null; // % oppure euro
  vat_rate?: number | string | null; // null/undefined = aliquota di default
}

export interface QuoteLineCalc {
  rate: number;
  gross: number; // qtà × prezzo
  discount: number; // sconto di riga
  amount: number; // gross - discount (quello che vede l'utente sulla riga)
  net: number; // amount dopo la quota di sconto globale (come persistito dal backend)
  tax: number;
  total: number; // net + tax
}

export interface QuoteVatGroup {
  rate: number;
  base: number; // imponibile del gruppo (maggiorazione inclusa)
  tax: number;
}

/** Tutti gli importi in EURO; il calcolo interno è in centesimi interi. */
export interface QuoteTotalsCalc {
  lines: QuoteLineCalc[]; // stesso ordine di items
  subtotal: number; // somma dei lordi di riga
  lineDiscountTotal: number;
  globalDiscount: number;
  discountTotal: number; // lineDiscountTotal + globalDiscount
  surcharge: number; // netto, IVA esclusa
  taxable: number; // subtotal - sconti + maggiorazione
  vat: QuoteVatGroup[];
  taxTotal: number;
  total: number; // taxable + taxTotal
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const rateKey = (rate: number) => rate.toFixed(2);

function discountCents(type: string | null | undefined, value: number, base: number): number {
  if (!type || value <= 0 || base <= 0) return 0;
  const d = type === "percentage" ? Math.round((base * value) / 100) : eurosToCents(value);
  return Math.min(d, base);
}

/** Ripartizione proporzionale col metodo del resto maggiore: la somma è esattamente `total`. */
function allocate(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (total <= 0 || sum <= 0) return weights.map(() => 0);

  const shares = weights.map((w) => Math.floor((total * w) / sum));
  const order = weights
    .map((w, i) => ({ i, r: (total * w) % sum }))
    .sort((a, b) => b.r - a.r || a.i - b.i);

  let left = total - shares.reduce((a, b) => a + b, 0);
  for (const { i } of order) {
    if (left <= 0) break;
    shares[i] += 1;
    left -= 1;
  }
  return shares;
}

export function calcQuoteTotals(
  items: CalcItemInput[],
  surcharge: number,
  defaultVatRate: number,
  globalDiscount?: { type: string; value: number },
): QuoteTotalsCalc {
  const surchargeCents = Math.max(0, eurosToCents(num(surcharge)));
  const defaultRate = num(defaultVatRate);

  // 1) valore di riga dopo lo sconto di riga
  const rows = items.map((item) => {
    const gross = Math.round(num(item.quantity) * eurosToCents(num(item.unit_price)));
    const discount = discountCents(item.discount_type, num(item.discount_value), gross);
    const rate =
      item.vat_rate === null || item.vat_rate === undefined || item.vat_rate === ""
        ? defaultRate
        : num(item.vat_rate);
    return { rate, gross, discount, amount: gross - discount, value: gross - discount };
  });

  // 2) sconto globale ripartito sulle righe
  const linesValue = rows.reduce((a, r) => a + r.value, 0);
  const globalCents = globalDiscount
    ? discountCents(globalDiscount.type, num(globalDiscount.value), linesValue)
    : 0;

  if (globalCents > 0) {
    const shares = allocate(globalCents, rows.map((r) => r.value));
    rows.forEach((r, i) => (r.value -= shares[i]));
  }

  // 3) gruppi per aliquota; la maggiorazione entra nel gruppo con aliquota di default
  type Group = { rate: number; gross: number; value: number; surcharge: number; rows: number[] };
  const groups = new Map<string, Group>();
  const group = (rate: number): Group => {
    const key = rateKey(rate);
    if (!groups.has(key)) groups.set(key, { rate, gross: 0, value: 0, surcharge: 0, rows: [] });
    return groups.get(key)!;
  };

  rows.forEach((r, i) => {
    const g = group(r.rate);
    g.rows.push(i);
    g.gross += r.gross;
    g.value += r.value;
  });

  if (surchargeCents > 0) {
    const g = group(defaultRate);
    g.surcharge = surchargeCents;
    g.value += surchargeCents;
  }

  // 4) un solo arrotondamento per gruppo + riconciliazione delle righe
  let taxable = 0;
  let taxTotal = 0;
  let discountTotal = 0;
  const lineNet: number[] = new Array(rows.length).fill(0);
  const lineTax: number[] = new Array(rows.length).fill(0);
  const vat: QuoteVatGroup[] = [];

  for (const g of groups.values()) {
    const groupTax = Math.round((g.value * g.rate) / 100);
    const surchargeTax = Math.round((g.surcharge * g.rate) / 100);

    taxable += g.value;
    taxTotal += groupTax;
    discountTotal += g.gross - (g.value - g.surcharge);
    vat.push({ rate: g.rate, base: g.value, tax: groupTax });

    let taxSum = 0;
    for (const i of g.rows) {
      lineNet[i] = rows[i].value;
      lineTax[i] = Math.round((rows[i].value * g.rate) / 100);
      taxSum += lineTax[i];
    }

    // l'ultima riga del gruppo assorbe i centesimi di differenza
    const last = g.rows[g.rows.length - 1];
    if (last !== undefined) lineTax[last] += groupTax - surchargeTax - taxSum;
  }

  const subtotal = rows.reduce((a, r) => a + r.gross, 0);
  const lineDiscountTotal = rows.reduce((a, r) => a + r.discount, 0);

  return {
    lines: rows.map((r, i) => ({
      rate: r.rate,
      gross: centsToEuros(r.gross),
      discount: centsToEuros(r.discount),
      amount: centsToEuros(r.amount),
      net: centsToEuros(lineNet[i]),
      tax: centsToEuros(lineTax[i]),
      total: centsToEuros(lineNet[i] + lineTax[i]),
    })),
    subtotal: centsToEuros(subtotal),
    lineDiscountTotal: centsToEuros(lineDiscountTotal),
    globalDiscount: centsToEuros(globalCents),
    discountTotal: centsToEuros(discountTotal),
    surcharge: centsToEuros(surchargeCents),
    taxable: centsToEuros(taxable),
    vat: vat.map((g) => ({ rate: g.rate, base: centsToEuros(g.base), tax: centsToEuros(g.tax) })),
    taxTotal: centsToEuros(taxTotal),
    total: centsToEuros(taxable + taxTotal),
  };
}