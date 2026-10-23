"use client";

import { useParams } from "next/navigation";

import QuoteForm from "../QuoteForm/QuoteForm";
import { QuotePreview } from "../QuoteReview/QuotePreview";
import { useQuoteForm } from "../hooks/useQuoteForm";
import styles from "./quote-editor.module.css";

export default function QuoteEditor() {
  const { slug } = useParams<{ slug: string }>();
  const form = useQuoteForm({ slug });

  return (
    <div className={styles.layout}>
      <div className={styles.formColumn}>
        <QuoteForm form={form} />
      </div>

      <aside className={`${styles.previewColumn} position-sticky`}>
        <QuotePreview
          settings={form.settings}
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
