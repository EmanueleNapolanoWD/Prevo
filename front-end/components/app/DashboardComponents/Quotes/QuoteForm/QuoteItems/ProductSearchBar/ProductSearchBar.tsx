"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/product";
import styles from "./product-searchbar.module.css";

const MIN_CHARS = 2;

interface ProductSearchBarProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  onQueryChange: (query: string) => void;
  onSelectProduct: (product: Product | null) => void;
}

export default function ProductSearchBar({
  products,
  isLoading,
  error,
  selectedProduct,
  onQueryChange,
  onSelectProduct,
}: ProductSearchBarProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const inputId = `${uid}-input`;
  const listboxId = `${uid}-results`;

  const hasMinChars = search.trim().length >= MIN_CHARS;
  const canSearch = hasMinChars && !selectedProduct;

  // Chiude il menu al click fuori dal componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setSearch(value);
    onQueryChange(value);

    // Modificando il testo la scelta precedente non è più valida
    if (selectedProduct) {
      onSelectProduct(null);
    }
    setIsOpen(value.trim().length >= MIN_CHARS);
  }

  function handleSelect(product: Product) {
    onSelectProduct(product);
    setSearch(product.name);
    onQueryChange("");
    setIsOpen(false);
  }

  const showList = isOpen && canSearch;

  return (
    <div ref={containerRef} className={styles.root}>
      <label htmlFor={inputId} className={styles.label}>
        Cerca dal catalogo prodotti
      </label>

      <Input
        id={inputId}
        type="text"
        placeholder="Inserisci nome o codice prodotto"
        value={search}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => canSearch && setIsOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={showList ? listboxId : undefined}
        aria-autocomplete="list"
      />

      {!hasMinChars && search.length > 0 && (
        <p className={styles.hint}>Digita almeno {MIN_CHARS} caratteri.</p>
      )}

      {showList && (
        <div id={listboxId} role="listbox" className={styles.dropdown}>
          {isLoading ? (
            <p className={styles.message}>Ricerca in corso…</p>
          ) : error ? (
            <p className={`${styles.message} ${styles.messageError}`}>{error}</p>
          ) : products.length > 0 ? (
            products.map((product) => (
              <button
                key={product.id}
                type="button"
                role="option"
                aria-selected={selectedProduct?.id === product.id}
                className={styles.option}
                onClick={() => handleSelect(product)}
              >
                <span className={styles.optionName}>{product.name}</span>
                {product.code && (
                  <span className={styles.optionMeta}>{product.code}</span>
                )}
              </button>
            ))
          ) : (
            <p className={styles.message}>Nessun prodotto trovato.</p>
          )}
        </div>
      )}
    </div>
  );
}