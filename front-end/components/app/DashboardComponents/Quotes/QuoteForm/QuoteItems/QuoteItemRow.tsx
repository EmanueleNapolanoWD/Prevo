"use client";

import { useState, useCallback } from "react";
import { ArrowUp, ArrowDown, Pencil, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calcLineTotal, parseNumber } from "@/lib/utils";
import type { QuoteItem, DiscountType } from "@/lib/Utility/Quote/quote.types";
import styles from "./quote-items.module.css";

interface QuoteItemRowProps {
  item: QuoteItem;
  index: number;
  currency: string;
  money: Intl.NumberFormat;
  onSave: (item: QuoteItem) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onEdit: (id: string) => void;
  isEditing: boolean;
}

interface RowDraft {
  name: string;
  description: string;
  quantity: string;
  unit: string;
  price: string;
  discountType: DiscountType;
  discountValue: string;
}

export function QuoteItemRow({
  item,
  index,
  money,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
  onEdit,
  isEditing,
}: QuoteItemRowProps) {
  const [editDraft, setEditDraft] = useState<RowDraft>({
    name: item.name,
    description: item.description,
    quantity: String(item.quantity),
    unit: item.unit,
    price: String(item.unit_price),
    discountType: item.discount_type,
    discountValue: String(item.discount_value),
  });
  const [rowError, setRowError] = useState<string | null>(null);

  const setField = useCallback(
    (field: keyof RowDraft, value: string) => {
      setEditDraft((d) => ({ ...d, [field]: value }));
      setRowError(null);
    },
    [],
  );

  const canMoveUp = index > 0;

  const handleSaveRow = useCallback(() => {
    const quantity = parseNumber(editDraft.quantity);
    const unitPrice = parseNumber(editDraft.price);
    const discountValue = parseNumber(
      editDraft.discountValue === "" ? "0" : editDraft.discountValue,
    );

    if (!editDraft.name.trim()) {
      setRowError("Inserisci un titolo per la voce.");
      return;
    }
    if (Number.isNaN(quantity) || quantity <= 0) {
      setRowError("La quantità deve essere maggiore di zero.");
      return;
    }
    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      setRowError("Inserisci un prezzo valido.");
      return;
    }
    if (Number.isNaN(discountValue) || discountValue < 0) {
      setRowError("Inserisci uno sconto valido.");
      return;
    }
    if (
      editDraft.discountType === "percentage" &&
      discountValue > 100
    ) {
      setRowError("Lo sconto percentuale non può superare 100.");
      return;
    }
    if (
      editDraft.discountType === "fixed" &&
      discountValue > quantity * unitPrice
    ) {
      setRowError("Lo sconto non può superare l'importo della voce.");
      return;
    }

    const updated: QuoteItem = {
      ...item,
      name: editDraft.name.trim(),
      description: editDraft.description.trim(),
      quantity,
      unit: editDraft.unit,
      unit_price: unitPrice,
      discount_type: editDraft.discountType,
      discount_value: discountValue,
      sort_order: index + 1,
    };

    onSave(updated);
  }, [item, index, editDraft, onSave]);

  const handleCancelRow = useCallback(() => {
    setEditDraft({
      name: item.name,
      description: item.description,
      quantity: String(item.quantity),
      unit: item.unit,
      price: String(item.unit_price),
      discountType: item.discount_type,
      discountValue: String(item.discount_value),
    });
    setRowError(null);
  }, [item]);

  const discountDisplay =
    item.discount_value > 0
      ? item.discount_type === "percentage"
        ? `${item.discount_value}%`
        : money.format(item.discount_value)
      : "—";

  if (isEditing) {
    return (
      <tr key={item.id}>
        <td colSpan={7} className="p-3">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Nome
                </label>
                <Input
                  value={editDraft.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Descrizione
                </label>
                <Input
                  value={editDraft.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Quantità
                </label>
                <Input
                  type="number"
                  value={editDraft.quantity}
                  onChange={(e) => setField("quantity", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Unità
                </label>
                <Input
                  value={editDraft.unit}
                  onChange={(e) => setField("unit", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Prezzo unitario
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={editDraft.price}
                  onChange={(e) => setField("price", e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Sconto
                </label>
                <div className="flex items-end gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={editDraft.discountValue}
                    onChange={(e) =>
                      setField("discountValue", e.target.value)
                    }
                    className="h-9 w-20"
                  />
                  <select
                    value={editDraft.discountType}
                    onChange={(e) =>
                      setField(
                        "discountType",
                        e.target.value as DiscountType,
                      )
                    }
                    className="h-9 bg-background border border-input rounded-md px-2 text-sm"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">€</option>
                  </select>
                </div>
              </div>
            </div>
            {rowError && (
              <p className="text-sm text-destructive">{rowError}</p>
            )}
            <div className="flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelRow}
              >
                <X className="size-4 mr-1" /> Annulla
              </Button>
              <Button
                type="button"
                onClick={handleSaveRow}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="size-4 mr-1" /> Salva
              </Button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr key={item.id}>
      <td className={styles.itemCell}>
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
        {discountDisplay}
      </td>
      <td className={`${styles.num} ${styles.total}`}>
        {money.format(calcLineTotal(item))}
      </td>
      <td className={styles.actionsCell}>
        <div className={styles.rowActions}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(item.id)}
            aria-label={`Modifica ${item.name}`}
            title="Modifica"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onMoveUp(index)}
            disabled={!canMoveUp}
            aria-label={`Sposta su ${item.name}`}
            title="Sposta su"
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onMoveDown(index)}
            aria-label={`Sposta giù ${item.name}`}
            title="Sposta giù"
          >
            <ArrowDown className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            aria-label={`Rimuovi ${item.name}`}
            title="Rimuovi"
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
