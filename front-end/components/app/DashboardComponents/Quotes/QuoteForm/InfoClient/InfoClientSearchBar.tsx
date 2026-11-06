"use client";

import { useState, useRef, useEffect } from "react";
import type { Client, ClientDetail } from "@/types/client";
import styles from "./info-client.module.css";

interface InfoClientSearchBarProps {
  clients: ClientDetail[];
  isLoading: boolean;
  error: string | null;
  selectedClient: ClientDetail | null;
  setSelectedClient: (client: Client | null) => void;
  onQueryChange: (query: string) => void;
  onSelectClient?: (client: Client | null) => void;
}

const MIN_CHARS = 2;

export default function InfoClientSearchBar({
  clients,
  selectedClient,
  setSelectedClient,
  isLoading,
  error,
  onQueryChange,
  onSelectClient,
}: InfoClientSearchBarProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canSearch = search.trim().length >= MIN_CHARS && !selectedClient;

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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSearch(value: string) {
    setSearch(value);
    onQueryChange(value);

    if (selectedClient) {
      setSelectedClient(null);
      onSelectClient?.(null); // il genitore non conterrà dati stantii
    }
    setIsOpen(value.trim().length >= MIN_CHARS);
  }

  function handleSelectClient(client: Client) {
    setSelectedClient(client);
    setSearch(client.display_name);
    onQueryChange("");
    setIsOpen(false);
    onSelectClient?.(client);
  }

  return (
    <div ref={containerRef} className={styles.searchWrap}>
      <h4 className={styles.title}>Seleziona dalla lista clienti</h4>

      <input
        type="text"
        className={styles.input}
        placeholder="Cerca per nome, cognome o ragione sociale..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => canSearch && setIsOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="client-search-results"
        aria-autocomplete="list"
      />

      {!canSearch && !selectedClient && search.length > 0 && (
        <p className={styles.hint}>Digita almeno {MIN_CHARS} caratteri.</p>
      )}

      {isOpen && canSearch && (
        <div
          id="client-search-results"
          role="listbox"
          className={styles.dropdown}
        >
          {isLoading ? (
            <p className={styles.dropdownMessage}>Ricerca in corso…</p>
          ) : error ? (
            <p className={styles.dropdownError}>{error}</p>
          ) : clients.length > 0 ? (
            clients.map((client) => (
              <button
                key={client.id}
                type="button"
                role="option"
                className={styles.option}
                aria-selected={selectedClient?.id === client.id}
                onClick={() => handleSelectClient(client)}
              >
                <span className={styles.optionName}>{client.display_name}</span>

                {client.type === "COMPANY" && client.name && (
                  <span className={styles.optionMeta}>
                    {client.name} {client.surname}
                  </span>
                )}

                {client.emails.length > 0 && (
                  <span className={styles.optionMeta}>
                    {client.emails[0].email}
                  </span>
                )}
              </button>
            ))
          ) : (
            <p className={styles.dropdownMessage}>Nessun cliente trovato.</p>
          )}
        </div>
      )}
    </div>
  );
}