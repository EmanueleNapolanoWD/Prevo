"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getClients } from "@/lib/Api/Clients/clients.actions";
import type { ClientDetail } from "@/types/client";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

type ContactId = string | number;

// Preferisce il contatto primario, altrimenti il primo della lista
function pickDefault<T extends { id: ContactId; is_primary?: boolean }>(
  items: T[] | undefined,
): T | undefined {
  if (!items || items.length === 0) return undefined;
  return items.find((item) => item.is_primary) ?? items[0];
}

export function useClientInfo(slug: string, query: string) {
  const [results, setResults] = useState<ClientDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedClient, setSelectedClientState] =
    useState<ClientDetail | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<ContactId | null>(null);
  const [selectedPhoneId, setSelectedPhoneId] = useState<ContactId | null>(null);
  const [selectedAddressId, setSelectedAddressId] =
    useState<ContactId | null>(null);

  // Ricerca con debounce
  useEffect(() => {
    const q = query.trim();
    let cancelled = false;

    const timer = setTimeout(
      async () => {
        if (q.length < MIN_CHARS) {
          setResults([]);
          setError(null);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          const res = await getClients(slug, { q });

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

          setError("Errore durante la ricerca dei clienti");
          setResults([]);
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      },
      q.length < MIN_CHARS ? 0 : DEBOUNCE_MS,
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug, query]);

  // Seleziona un cliente e preseleziona email, telefono e indirizzo di default
  const setSelectedClient = useCallback((client: ClientDetail | null) => {
    setSelectedClientState(client);
    setSelectedEmailId(pickDefault(client?.emails)?.id ?? null);
    setSelectedPhoneId(pickDefault(client?.phones)?.id ?? null);
    setSelectedAddressId(pickDefault(client?.addresses)?.id ?? null);
  }, []);

  const selectedEmail = useMemo(
    () => selectedClient?.emails.find((e) => e.id === selectedEmailId) ?? null,
    [selectedClient, selectedEmailId],
  );

  const selectedPhone = useMemo(
    () => selectedClient?.phones.find((p) => p.id === selectedPhoneId) ?? null,
    [selectedClient, selectedPhoneId],
  );

  const selectedAddress = useMemo(
    () =>
      selectedClient?.addresses.find((a) => a.id === selectedAddressId) ?? null,
    [selectedClient, selectedAddressId],
  );

  return {
    results,
    isLoading,
    error,
    selectedClient,
    setSelectedClient,
    selectedEmail,
    selectedPhone,
    selectedAddress,
    setSelectedEmailId,
    setSelectedPhoneId,
    setSelectedAddressId,
  };
}