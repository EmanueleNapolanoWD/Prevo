"use client";

import { useState, useId } from "react";
import styles from "../companyform.module.css";
import { Plus, Trash2, Star } from "lucide-react";
import type { ContactItem } from "@/lib/Utility/Companies/companies.type";

type Props = {
  name: "emails" | "phones";
  label: string;
  type: "email" | "tel";
  placeholder?: string;
  initialItems?: ContactItem[];
  required?: boolean;
  addLabel?: string;
};

const emptyItem = (primary = false): ContactItem => ({
  value: "",
  is_primary: primary,
});

export default function MultiContactField({
  name,
  label,
  type,
  placeholder,
  initialItems = [],
  required = false,
  addLabel = "Aggiungi",
}: Props) {
  const uid = useId();

  const [items, setItems] = useState<(ContactItem & { key: string })[]>(() => {
    const base = initialItems?.length ? initialItems : [emptyItem(true)];
    // garantisce sempre un predefinito
    const hasPrimary = base.some((i) => i.is_primary);
    return base.map((i, idx) => ({
      ...i,
      is_primary: hasPrimary ? i.is_primary : idx === 0,
      key: `${uid}-${idx}`,
    }));
  });

  const update = (key: string, value: string) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, value } : i)));
  };

  const setPrimary = (key: string) => {
    setItems((prev) => prev.map((i) => ({ ...i, is_primary: i.key === key })));
  };

  const add = () => {
    setItems((prev) => [
      ...prev,
      { ...emptyItem(false), key: `${uid}-${Date.now()}` },
    ]);
  };

  const remove = (key: string) =>
    setItems((prev) => {
      const next = prev.filter((i) => i.key !== key);
      if (next.length === 0) return [{ ...emptyItem(true), key }];

      // se rimuovo predefinito il primo diventa predefinito
      if (!next.some((i) => i.is_primary)) next[0].is_primary = true;
      return [...next];
    });

  return (
    <fieldset className={`${styles.full} ${styles.multiField}`}>
      <legend className={styles.multiLegend}>{label}</legend>

      <ul className={styles.multiList}>
        {items.map((item, idx) => (
          <li
            key={item.key}
            className={`${styles.multiRow} ${
              item.is_primary ? styles.multiRowPrimary : ""
            }`}
          >
            {item.id != null && (
              <input
                type="hidden"
                name={`${name}[${idx}][id]`}
                value={item.id}
              />
            )}

            <input
              className={styles.multiInput}
              type={type}
              name={`${name}[${idx}][value]`}
              value={item.value}
              placeholder={placeholder}
              required={required && item.is_primary}
              aria-label={`${label} ${idx + 1}`}
              onChange={(e) => update(item.key, e.target.value)}
            />

            {/* il valore viaggia nel FormData come "1" / "0" */}
            <input
              type="hidden"
              name={`${name}[${idx}][is_primary]`}
              value={item.is_primary ? "1" : "0"}
            />

            <label className={styles.primaryToggle}>
              <input
                type="radio"
                name={`${name}-primary`}
                checked={item.is_primary}
                onChange={() => setPrimary(item.key)}
              />
              <Star
                size={14}
                aria-hidden
                fill={item.is_primary ? "currentColor" : "none"}
              />
              <span>{item.is_primary ? "Predefinito" : "Imposta"}</span>
            </label>

            <button
              type="button"
              className={styles.iconButton}
              onClick={() => remove(item.key)}
              disabled={items.length === 1 && !item.value}
              aria-label={`Rimuovi ${label.toLowerCase()} ${idx + 1}`}
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className={styles.addButton} onClick={add}>
        <Plus size={14} /> {addLabel}
      </button>
    </fieldset>
  );
}
