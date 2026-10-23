"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calcLineTotal, parseNumber } from "@/lib/utils";
import type { Product } from "@/types/product";
import type { QuoteItem, DiscountType } from "@/types/quote";
import ProductSearchBar from "./ProductSearchBar/ProductSearchBar";
import { useQuoteItems } from "./useQuoteItems";
import styles from "./quote-items.module.css";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectValue,
} from "@/components/ui/select";

interface QuoteItemsProps {
  items: QuoteItem[];
  onItemsChange: (items: QuoteItem[]) => void;
  currency?: string;
}

// Stato del "modulo di inserimento": tutto stringa, si converte solo all'aggiunta
interface Draft {
  productId: string | null;
  name: string;
  description: string;
  quantity: string;
  unit: string;
  price: string;
  discountType: DiscountType;
  discountValue: string;
}

const EMPTY_DRAFT: Draft = {
  productId: null,
  name: "",
  description: "",
  quantity: "1",
  unit: "pz",
  price: "",
  discountType: "percentage",
  discountValue: "0",
};

function Field({
  id,
  label,
  wide,
  children,
}: {
  id: string;
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ""}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function QuoteItems({
  items,
  onItemsChange,
  currency = "EUR",
}: QuoteItemsProps) {
  const { slug } = useParams<{ slug: string }>();
  const uid = useId();

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [formError, setFormError] = useState<string | null>(null);
  // Cambiando la key la search bar si rimonta e il suo testo si svuota
  const [searchKey, setSearchKey] = useState(0);

  const {
    results,
    isLoading,
    error,
    selectedProduct,
    setSelectedProduct,
    clearSelection,
  } = useQuoteItems(slug, query);

  const money = useMemo(
    () => new Intl.NumberFormat("it-IT", { style: "currency", currency }),
    [currency],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + calcLineTotal(item), 0),
    [items],
  );

  function setField<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [field]: value }));
    setFormError(null);
  }

  // Il prodotto scelto precompila il modulo; quantità e sconto restano modificabili
  function handleSelectProduct(product: Product | null) {
    console.log("prodotto in quote items: ", product);
    setSelectedProduct(product);
    if (!product) return;

    setDraft((d) => ({
      ...d,
      productId: product.id,
      name: product.name,
      description: product.description ?? "",
      unit: product.unit ?? d.unit,
      price: product.sale_price != null ? String(product.sale_price) : d.price,
    }));
    setFormError(null);
  }

  function resetComposer() {
    setDraft(EMPTY_DRAFT);
    setFormError(null);
    setQuery("");
    clearSelection();
    setSearchKey((k) => k + 1);
  }

  function handleAdd() {
    const quantity = parseNumber(draft.quantity);
    const unitPrice = parseNumber(draft.price);
    const discountValue = parseNumber(
      draft.discountValue === "" ? "0" : draft.discountValue,
    );
    if (!draft.name.trim()) {
      setFormError("Inserisci un titolo per la voce.");
      return;
    }
    if (Number.isNaN(quantity) || quantity <= 0) {
      setFormError("La quantità deve essere maggiore di zero.");
      return;
    }
    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      setFormError("Inserisci un prezzo valido.");
      return;
    }
    if (Number.isNaN(discountValue) || discountValue < 0) {
      setFormError("Inserisci uno sconto valido.");
      return;
    }
    if (draft.discountType === "percentage" && discountValue > 100) {
      setFormError("Lo sconto percentuale non può superare 100.");
      return;
    }
    if (
      draft.discountType === "fixed" &&
      discountValue > quantity * unitPrice
    ) {
      setFormError("Lo sconto non può superare l'importo della voce.");
      return;
    }

    const newItem: QuoteItem = {
      id: crypto.randomUUID(),
      product_id: draft.productId,
      name: draft.name.trim(),
      description: draft.description.trim(),
      quantity,
      unit: draft.unit.trim(),
      unit_price: unitPrice,
      discount_type: draft.discountType,
      discount_value: discountValue,
    };

    onItemsChange([...items, newItem]);
    resetComposer();
  }

  function handleRemove(id: string) {
    onItemsChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className={styles.root}>
      {/* Modulo di inserimento voce */}
      <div className={styles.composer}>
        <ProductSearchBar
          key={searchKey}
          products={results}
          isLoading={isLoading}
          error={error}
          selectedProduct={selectedProduct}
          onQueryChange={setQuery}
          onSelectProduct={handleSelectProduct}
        />

        <div className={styles.fields}>
          <Field id={`${uid}-name`} label="Titolo" wide>
            <Input
              id={`${uid}-name`}
              value={draft.name}
              onChange={(e) => setField("name", e.target.value)}
            />
          </Field>

          <Field id={`${uid}-quantity`} label="Quantità">
            <Input
              id={`${uid}-quantity`}
              inputMode="decimal"
              value={draft.quantity}
              onChange={(e) => setField("quantity", e.target.value)}
            />
          </Field>

          <Field id={`${uid}-unit`} label="Unità">
            <Input
              id={`${uid}-unit`}
              value={draft.unit}
              onChange={(e) => setField("unit", e.target.value)}
            />
          </Field>

          <Field id={`${uid}-sale_price`} label="Prezzo unitario">
            <Input
              id={`${uid}-sale_price`}
              inputMode="decimal"
              value={draft.price}
              onChange={(e) => setField("price", e.target.value)}
            />
          </Field>

          <Field id={`${uid}-discount`} label="Sconto">
            <div className={styles.discountRow}>
              <Input
                id={`${uid}-discount`}
                inputMode="decimal"
                value={draft.discountValue}
                onChange={(e) => setField("discountValue", e.target.value)}
              />
              <Select
                value={draft.discountType}
                onValueChange={(v) =>
                  setField("discountType", v as DiscountType)
                }
              >
                <SelectTrigger className="w-[90px]" aria-label="Tipo di sconto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="fixed">
                      {currency === "EUR" ? "€" : currency}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </Field>

          <Field id={`${uid}-description`} label="Descrizione" wide>
            <Input
              id={`${uid}-description`}
              value={draft.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </Field>
        </div>

        {formError && (
          <p role="alert" className={styles.error}>
            {formError}
          </p>
        )}

        <div className={styles.actions}>
          <Button type="button" onClick={handleAdd}>
            Aggiungi voce
          </Button>
          <Button type="button" variant="outline" onClick={resetComposer}>
            Svuota campi
          </Button>
        </div>
      </div>

      {/* Lista voci */}
      {items.length === 0 ? (
        <p className={styles.empty}>Nessuna voce inserita.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Voce</th>
                <th className={styles.num}>Qtà</th>
                <th className={styles.num}>Prezzo</th>
                <th className={styles.num}>Sconto</th>
                <th className={styles.num}>Totale</th>
                <th>
                  <span className={styles.srOnly}>Azioni</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.itemName}>{item.name}</div>
                    {item.description && (
                      <div className={styles.itemDesc}>{item.description}</div>
                    )}
                  </td>
                  <td className={styles.num}>
                    {item.quantity} {item.unit}
                  </td>
                  <td className={styles.num}>
                    {money.format(item.unit_price)}
                  </td>
                  <td className={styles.num}>
                    {item.discount_value > 0
                      ? item.discount_type === "percentage"
                        ? `${item.discount_value}%`
                        : money.format(item.discount_value)
                      : "—"}
                  </td>
                  <td className={styles.num}>
                    {money.format(calcLineTotal(item))}
                  </td>
                  <td className={styles.num}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Rimuovi ${item.name}`}
                      onClick={() => handleRemove(item.id)}
                    >
                      Rimuovi
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className={styles.num}>
                  Subtotale voci
                </td>
                <td className={`${styles.num} ${styles.total}`}>
                  {money.format(subtotal)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
