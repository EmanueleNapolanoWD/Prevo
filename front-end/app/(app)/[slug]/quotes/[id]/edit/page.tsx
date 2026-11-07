import { notFound } from "next/navigation";
import { getQuoteAction } from "@/lib/Api/Quote/quote.action";
import { getClientById } from "@/lib/Api/Clients/clients.server"; // adatta il nome reale
import QuoteEditor from "@/components/app/DashboardComponents/Quotes/QuoteEditor/QuoteEditor";
import styles from "./page.module.css";

type EditQuotePageProps = {
  params: Promise<{ slug: string; id: string }>;
};

export default async function EditQuotePage({ params }: EditQuotePageProps) {
  const { slug, id } = await params;

  const quote = await getQuoteAction(slug, id);
  if (!quote) notFound();

  const client = quote.client_id
    ? await getClientById(slug, quote.client_id)
    : null;

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Modifica preventivo</h1>
      <QuoteEditor
        key={quote.id}
        mode="edit"
        quote={quote}
        initialClient={client}
      />
    </main>
  );
}
