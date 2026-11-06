"use client";

import { memo, useDeferredValue } from "react";
import type { QuoteSettingsData } from "@/lib/Utility/QuoteSettings/quote-settings.types";
import { QuoteDocument } from "../../../Quotes/QuoteReview/QuoteDocument/QuoteDocument";
import { useQuotePreviewData } from "../hooks/useQuotePreviewData";

// Non si ri-renderizza per stati estranei all'anteprima (es. saving/message)
const MemoQuoteDocument = memo(QuoteDocument);

export default function QuotePreviewPanel({
  values,
}: {
  values: QuoteSettingsData;
}) {
  // L'input resta fluido: l'anteprima si aggiorna con priorità più bassa
  const deferredValues = useDeferredValue(values);
  const previewProps = useQuotePreviewData(deferredValues);

  return (
    <aside
      aria-label="Anteprima del preventivo"
      className="sticky top-6 hidden h-fit max-h-[calc(100vh-3rem)] min-w-0 overflow-auto rounded-xl border bg-muted/40 p-4 lg:block"
    >
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Anteprima in tempo reale
      </div>
      <MemoQuoteDocument {...previewProps} />
    </aside>
  );
}
