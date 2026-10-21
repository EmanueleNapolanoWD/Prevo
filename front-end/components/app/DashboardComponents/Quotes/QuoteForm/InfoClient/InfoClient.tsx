"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import InfoClientSearchBar from "./InfoClientSearchBar";
import InfoClientDetail from "./InfoClientDetail";
import { useClientInfo } from "./useClientInfo";
import type { ClientDetail } from "@/types/client";

export interface QuoteContact {
  email: string | null;
  phone: string | null;
}

interface InfoClientProps {
  onSelectClient: (client: ClientDetail | null) => void;
  onContactChange?: (contact: QuoteContact) => void;
}

export default function InfoClient({
  onSelectClient,
  onContactChange,
}: InfoClientProps) {
  const { slug } = useParams<{ slug: string }>();
  const [query, setQuery] = useState<string>("");

  const {
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
  } = useClientInfo(slug, query);

  // Ref per evitare loop di render se il genitore non memoizza la callback
  const onContactChangeRef = useRef(onContactChange);
  useEffect(() => {
    onContactChangeRef.current = onContactChange;
  }, [onContactChange]);

  const email = selectedEmail?.email ?? null;
  const phone = selectedPhone?.phone ?? null; // adatta il nome del campo

  // Comunica al preventivo email e telefono scelti
  useEffect(() => {
    onContactChangeRef.current?.({ email, phone });
  }, [email, phone]);

  return (
    <>
      {/* Ricerca cliente */}
      <InfoClientSearchBar
        clients={results}
        isLoading={isLoading}
        error={error}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        onQueryChange={setQuery}
        onSelectClient={onSelectClient}
      />

      {/* Resoconto cliente: visibile solo dopo la selezione */}
      {selectedClient && (
        <InfoClientDetail
          client={selectedClient}
          selectedEmailId={selectedEmail?.id ?? null}
          selectedPhoneId={selectedPhone?.id ?? null}
          selectedAddressId={selectedAddress?.id ?? null}
          onAddressChange={setSelectedAddressId}
          onEmailChange={setSelectedEmailId}
          onPhoneChange={setSelectedPhoneId}
        />
      )}
    </>
  );
}