import {
  QuoteDocument,
  type QuoteDocumentProps,
} from "./QuoteDocument/QuoteDocument";
import styles from "./QuotePreview.module.css";

// La firma pubblica resta identica a quella originale: stesse props di QuoteDocument.
export type QuotePreviewProps = QuoteDocumentProps;

/**
 * Anteprima nell'editor: si occupa solo del contenitore (sfondo, sticky,
 * scroll). Il documento vero e proprio è delegato a QuoteDocument.
 */
export function QuotePreview({
  settings,
  company,
  header,
  tax,
  appearance,
  contact,
  selectedClient,
  items,
  totals,
  money,
}: QuotePreviewProps) {
  console.log("appaerance in quote preview: ", appearance);
  return (
    <div className={styles.previewWrapper}>
      <QuoteDocument
        settings={settings}
        company={company}
        header={header}
        tax={tax}
        appearance={appearance}
        contact={contact}
        selectedClient={selectedClient}
        items={items}
        totals={totals}
        money={money}
      />
    </div>
  );
}
