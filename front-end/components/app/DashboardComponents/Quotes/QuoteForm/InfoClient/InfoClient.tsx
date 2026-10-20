"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import InfoClientSearchBar from "./InfoClientSearchBar";
import type { Client } from "@/types/client";
import { useClientInfo } from "./useClientInfo";

interface InfoClientProps {
  onSelectClient: (client: Client | null) => void;
}

export default function InfoClient({ onSelectClient }: InfoClientProps) {
  const { slug } = useParams<{ slug: string }>();
  const [query, setQuery] = useState<string>("");
  const { results, isLoading, error } = useClientInfo(slug, query);

  return (
    <>
      {/* search bar */}
      <InfoClientSearchBar
        clients={results}
        isLoading={isLoading}
        error={error}
        onQueryChange={setQuery}
        onSelectClient={onSelectClient}
      />
    </>
  );
}
