"use client";

import { useEffect, useState } from "react";
import { getClients } from "@/lib/Api/Clients/clients.actions";
import type { Client } from "@/types/client";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

export function useClientInfo(slug: string, query: string) {
  const [results, setResults] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();

    if (q.length < MIN_CHARS) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await getClients(slug, q);

        if (cancelled) return;

        if ("ok" in res && res.ok === false) {
          setError(res.message);
          setResults([]);
        } else if ("data" in res) {
          setError(null);
          setResults(res.data);
        }
        setIsLoading(false);
      } catch {
        if (cancelled) return;
        setError("Errore durante la ricerca dei clienti");
        setResults([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug, query]);

  return { results, isLoading, error };
}
