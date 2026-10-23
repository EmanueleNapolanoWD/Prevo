import { Suspense } from "react";
import QuoteEditor from "@/components/app/DashboardComponents/Quotes/QuoteEditor/QuoteEditor";

export default function NewQuotePage() {
  return (
    <Suspense fallback={<p>Caricamento…</p>}>
      <QuoteEditor />
    </Suspense>
  );
}