"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Client } from "@/types/client";

interface InfoClientSearchBarProps {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  onQueryChange: (query: string) => void;
  onSelectClient?: (client: Client | null) => void;
}

const MIN_CHARS = 2;

export default function InfoClientSearchBar({
  clients,
  isLoading,
  error,
  onQueryChange,
  onSelectClient,
}: InfoClientSearchBarProps) {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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
    <div ref={containerRef} className="relative w-full space-y-2">
      <h4 className="text-sm font-medium">Seleziona dalla lista clienti</h4>

      <Input
        type="text"
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
        <p className="text-xs text-muted-foreground">
          Digita almeno {MIN_CHARS} caratteri.
        </p>
      )}

      {isOpen && canSearch && (
        <div
          id="client-search-results"
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {isLoading ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              Ricerca in corso…
            </p>
          ) : error ? (
            <p className="px-3 py-4 text-center text-sm text-destructive">
              {error}
            </p>
          ) : clients.length > 0 ? (
            clients.map((client) => (
              <Button
                key={client.id}
                type="button"
                variant="ghost"
                role="option"
                aria-selected={selectedClient?.id === client.id}
                onClick={() => handleSelectClient(client)}
                className="flex h-auto w-full flex-col items-start gap-1 rounded-sm px-3 py-2 text-left text-sm"
              >
                <span className="font-medium">{client.display_name}</span>

                {client.type === "COMPANY" && client.name && (
                  <span className="text-xs text-muted-foreground">
                    {client.name} {client.surname}
                  </span>
                )}

                {client.emails.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {client.emails[0].email}
                  </span>
                )}
              </Button>
            ))
          ) : (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              Nessun cliente trovato.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
