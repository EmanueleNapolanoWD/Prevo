"use client";

import { useCallback, useState } from "react";
import { calcLineTotal } from "@/lib/utils";
import type { QuoteItem } from "@/lib/Utility/Quote/quote.types";
import { QuoteItemRow } from "./QuoteItemRow";
import styles from "./quote-items.module.css";

interface QuoteItemsTableProps {
  items: QuoteItem[];
  onItemsChange: (items: QuoteItem[]) => void;
  currency: string;
  money: Intl.NumberFormat;
}

export function QuoteItemsTable({
  items,
  onItemsChange,
  currency,
  money,
}: QuoteItemsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + calcLineTotal(item), 0);

  const handleMove = useCallback(
    (fromIndex: number, toIndex: number) => {
      const next = [...items];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);

      next.forEach((item, i) => {
        item.sort_order = i + 1;
      });

      onItemsChange(next);
      setEditingId(null);
    },
    [items, onItemsChange],
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      handleMove(index, index - 1);
    },
    [handleMove],
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= items.length - 1) return;
      handleMove(index, index + 1);
    },
    [handleMove, items.length],
  );

  const handleSaveItem = useCallback(
    (updatedItem: QuoteItem) => {
      onItemsChange(
        items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        ),
      );
      setEditingId(null);
    },
    [items, onItemsChange],
  );

  const handleDeleteItem = useCallback(
    (id: string) => {
      onItemsChange(items.filter((item) => item.id !== id));
      setEditingId(null);
    },
    [items, onItemsChange],
  );

  const handleEditItem = useCallback((id: string) => {
    setEditingId(id);
  }, []);

  return (
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
          {items.map((item, index) => (
            <QuoteItemRow
              key={item.id}
              item={item}
              index={index}
              currency={currency}
              money={money}
              onSave={handleSaveItem}
              onDelete={handleDeleteItem}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onEdit={handleEditItem}
              isEditing={editingId === item.id}
            />
          ))}
        </tbody>
        {items.length > 0 && (
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
        )}
      </table>
    </div>
  );
}