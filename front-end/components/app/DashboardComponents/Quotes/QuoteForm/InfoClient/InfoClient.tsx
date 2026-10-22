"use client";

import InfoClientSearchBar from "./InfoClientSearchBar";
import InfoClientDetail from "./InfoClientDetail";
import type { ClientDetail } from "@/types/client";

type ContactId = string | number;

// Componente controllato: ricerca, selezione e contatti vivono in useQuoteForm
interface InfoClientProps {
  // ricerca
  clients: ClientDetail[];
  isLoading: boolean;
  error: string | null;
  onQueryChange: (query: string) => void;

  // selezione
  selectedClient: ClientDetail | null;
  onSelectClient: (client: ClientDetail | null) => void;

  // contatti scelti
  selectedEmailId: ContactId | null;
  selectedPhoneId: ContactId | null;
  selectedAddressId: ContactId | null;
  onEmailChange: (id: ContactId | null) => void;
  onPhoneChange: (id: ContactId | null) => void;
  onAddressChange: (id: ContactId | null) => void;
}

export default function InfoClient({
  clients,
  isLoading,
  error,
  onQueryChange,
  selectedClient,
  onSelectClient,
  selectedEmailId,
  selectedPhoneId,
  selectedAddressId,
  onEmailChange,
  onPhoneChange,
  onAddressChange,
}: InfoClientProps) {
  return (
    <>
      {/* Ricerca cliente */}
      <InfoClientSearchBar
        clients={clients}
        isLoading={isLoading}
        error={error}
        selectedClient={selectedClient}
        setSelectedClient={onSelectClient}
        onQueryChange={onQueryChange}
        onSelectClient={onSelectClient}
      />

      {/* Resoconto cliente: visibile solo dopo la selezione */}
      {selectedClient && (
        <InfoClientDetail
          client={selectedClient}
          selectedEmailId={selectedEmailId}
          selectedPhoneId={selectedPhoneId}
          selectedAddressId={selectedAddressId}
          onEmailChange={onEmailChange}
          onPhoneChange={onPhoneChange}
          onAddressChange={onAddressChange}
        />
      )}
    </>
  );
}