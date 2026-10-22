"use client";

import { useCallback, useEffect, useState } from "react";
import { getProducts } from "@/lib/Api/Product/product.actions";
import type { Product } from "@/types/product";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

export function useQuoteItems(slug: string, query: string) {
  const [results, setResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Ricerca con debounce
  useEffect(() => {
    const q = query.trim();
    let cancelled = false;

    // Sotto la soglia di caratteri si resetta subito, senza attendere il debounce
    const delay = q.length < MIN_CHARS ? 0 : DEBOUNCE_MS;

    const timer = setTimeout(async () => {
      if (q.length < MIN_CHARS) {
        setResults([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await getProducts(slug, { q });

        if (cancelled) return;

        if ("ok" in res && res.ok === false) {
          setError(res.message);
          setResults([]);
        } else if ("data" in res) {
            
          setResults(res.data);
          setError(null);
        }
      } catch {
        if (cancelled) return;

        setError("Errore durante la ricerca dei prodotti");
        setResults([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug, query]);

  const clearSelection = useCallback(() => setSelectedProduct(null), []);

  return {
    results,
    isLoading,
    error,
    selectedProduct,
    setSelectedProduct,
    clearSelection,
  };
}