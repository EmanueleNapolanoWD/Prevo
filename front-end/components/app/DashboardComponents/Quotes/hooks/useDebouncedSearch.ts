import { useState, useCallback, useEffect } from "react";
import { DEBOUNCE_MS, MIN_CHARS } from "@/lib/Utility/Quote/quote.consts";
import type { SearchResponse } from "@/lib/Utility/Quote/quote.types";

// Ricerca con debounce (prodotti e clienti)
export function useDebouncedSearch<T>(
  // deve essere stabile (useCallback), altrimenti l'effetto riparte a ogni render
  fetcher: (query: string) => Promise<SearchResponse<T>>,
  errorMessage: string,
) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    let cancelled = false;
    const delay = q.length < MIN_CHARS ? 0 : DEBOUNCE_MS;

    const timer = setTimeout(async () => {
      if (q.length < MIN_CHARS) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetcher(q);
        if (cancelled) return;

        if ("ok" in res && res.ok === false) {
          setError(res.message);
          setResults([]);
        } else if ("data" in res) {
          setResults(res.data);
        }
      } catch {
        if (cancelled) return;
        setError(errorMessage);
        setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, fetcher, errorMessage]);

  const reset = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
  }, []);

  return { query, setQuery, results, loading, error, reset };
}
