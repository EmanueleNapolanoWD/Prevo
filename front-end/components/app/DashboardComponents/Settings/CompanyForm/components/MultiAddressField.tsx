"use client";

import { useState, useId } from "react";
import { Plus, Trash2, Star } from "lucide-react";
import type {
  AddressItem,
  CompanyAddressType,
} from "@/lib/Utility/Companies/companies.type";
import styles from "../companyform.module.css";

const TYPE_LABELS: Record<CompanyAddressType, string> = {
  legal: "Sede legale",
  operational: "Sede operativa",
  administrative: "Sede amministrativa",
  billing: "Fatturazione",
  shipping: "Spedizione",
};

type Row = AddressItem & { key: string };

const emptyAddress = (
  primary: boolean,
  type: CompanyAddressType,
): AddressItem => ({
  type,
  label: "",
  address: "",
  address_extra: "",
  postal_code: "",
  city: "",
  province: "",
  country_code: "IT",
  is_primary: primary,
});

export default function MultiAddressField({
  initialItems,
}: {
  initialItems?: AddressItem[];
}) {
  const uid = useId();

  const [items, setItems] = useState<Row[]>(() => {
    const base = initialItems?.length
      ? initialItems
      : [emptyAddress(true, "legal")];
    const hasPrimary = base.some((i) => i.is_primary);
    return base.map((i, idx) => ({
      ...i,
      is_primary: hasPrimary ? i.is_primary : idx === 0,
      key: `${uid}-${idx}`,
    }));
  });

  const patch = (key: string, p: Partial<AddressItem>) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...p } : i)));

  const setPrimary = (key: string) =>
    setItems((prev) => prev.map((i) => ({ ...i, is_primary: i.key === key })));

  const add = () =>
    setItems((prev) => [
      ...prev,
      { ...emptyAddress(false, "operational"), key: `${uid}-${Date.now()}` },
    ]);

  const remove = (key: string) =>
    setItems((prev) => {
      const next = prev.filter((i) => i.key !== key);
      if (next.length === 0) return [{ ...emptyAddress(true, "legal"), key }];
      if (!next.some((i) => i.is_primary)) next[0].is_primary = true;
      return [...next];
    });

  return (
    <div className={`${styles.full} ${styles.multiField}`}>
      <ul className={styles.multiList}>
        {items.map((item, idx) => {
          const n = (f: string) => `addresses[${idx}][${f}]`;
          const req = item.is_primary; // obbligatori solo sul predefinito

          return (
            <li
              key={item.key}
              className={`${styles.addressCard} ${
                item.is_primary ? styles.multiRowPrimary : ""
              }`}
            >
              {item.id != null && (
                <input type="hidden" name={n("id")} value={item.id} />
              )}
              <input
                type="hidden"
                name={n("country_code")}
                value={item.country_code}
              />
              <input
                type="hidden"
                name={n("is_primary")}
                value={item.is_primary ? "1" : "0"}
              />

              <div className={styles.addressCardHeader}>
                <select
                  name={n("type")}
                  value={item.type}
                  onChange={(e) =>
                    patch(item.key, {
                      type: e.target.value as CompanyAddressType,
                    })
                  }
                  className={styles.multiSelect}
                  aria-label={`Tipo indirizzo ${idx + 1}`}
                >
                  {Object.entries(TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>

                <label className={styles.primaryToggle}>
                  <input
                    type="radio"
                    name="addresses-primary"
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
                  aria-label={`Rimuovi indirizzo ${idx + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className={styles.addressGrid}>
                <label className={styles.addressWide}>
                  <span>Indirizzo</span>
                  <input
                    name={n("address")}
                    value={item.address}
                    placeholder="Via Roma, 1"
                    required={req}
                    onChange={(e) =>
                      patch(item.key, { address: e.target.value })
                    }
                  />
                </label>

                <label className={styles.addressWide}>
                  <span>Dettagli (scala, interno…)</span>
                  <input
                    name={n("address_extra")}
                    value={item.address_extra ?? ""}
                    onChange={(e) =>
                      patch(item.key, { address_extra: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span>CAP</span>
                  <input
                    name={n("postal_code")}
                    value={item.postal_code}
                    placeholder="20100"
                    inputMode="numeric"
                    maxLength={5}
                    pattern="[0-9]{5}"
                    required={req}
                    onChange={(e) =>
                      patch(item.key, { postal_code: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span>Città</span>
                  <input
                    name={n("city")}
                    value={item.city}
                    placeholder="Milano"
                    required={req}
                    onChange={(e) => patch(item.key, { city: e.target.value })}
                  />
                </label>

                <label>
                  <span>Provincia</span>
                  <input
                    name={n("province")}
                    value={item.province ?? ""}
                    placeholder="MI"
                    maxLength={2}
                    required={req}
                    onChange={(e) =>
                      patch(item.key, {
                        province: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </label>
              </div>
            </li>
          );
        })}
      </ul>

      <button type="button" className={styles.addButton} onClick={add}>
        <Plus size={14} /> Aggiungi indirizzo
      </button>
    </div>
  );
}
