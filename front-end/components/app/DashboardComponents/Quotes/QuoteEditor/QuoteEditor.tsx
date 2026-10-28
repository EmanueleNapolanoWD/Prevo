"use client";

import { useParams, useRouter } from "next/navigation";

import QuoteForm from "../QuoteForm/QuoteForm";
import { QuotePreview } from "../QuoteReview/QuotePreview";
import { useQuoteForm } from "../hooks/useQuoteForm";
import type { QuoteDetail } from "@/types/quote";
import type { ClientDetail } from "@/types/client";
import styles from "./quote-editor.module.css";

type QuoteEditorProps =
  | { mode?: "create"; quote?: undefined; initialClient?: undefined }
  | { mode: "edit"; quote: QuoteDetail; initialClient?: ClientDetail | null };

export default function QuoteEditor({
  mode = "create",
  quote,
  initialClient,
}: QuoteEditorProps) {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const form = useQuoteForm({ slug, quote, initialClient });

  function handleSuccess() {
    router.push(`/${slug}/quotes`);
    router.refresh();
  }

  console.log('form', form)

  return (
    <div className={styles.layout}>
      <div className={styles.formColumn}>
        <QuoteForm form={form} mode={mode} onSuccess={handleSuccess} />
      </div>

      <aside className={`${styles.previewColumn} position-sticky`}>
        <QuotePreview
          settings={form.settings}
          company={form.company}
          header={form.header}
          tax={form.tax}
          appearance={form.appearance}
          contact={form.contact}
          selectedClient={form.selectedClient}
          items={form.items}
          totals={form.totals}
          money={form.money}
        />
      </aside>
    </div>
  );
}