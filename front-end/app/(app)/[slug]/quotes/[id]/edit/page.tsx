import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, FilePlus2 } from "lucide-react";

import { getQuoteAction } from "@/lib/Api/Quote/quote.action";
import { getClientById, isErrorResult } from "@/lib/Api/Clients/clients.server";
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
    ? (await (async () => {
        const res = await getClientById(slug, quote.client_id);
        return isErrorResult(res) ? null : res;
      })())
    : null;

    // console.log('quote in page edit quote: ',quote)

  return (
    <main className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="./.." className={styles.breadcrumbLink}>
          Preventivi
        </Link>

        <ChevronRight size={15} aria-hidden="true" />

        <span aria-current="page">Modifica preventivo</span>
      </nav>

      <header className={styles.header}>
        <div className={styles.heading}>
          <div className={styles.icon}>
            <FilePlus2 size={23} strokeWidth={1.8} />
          </div>

          <div>
            <span className={styles.eyebrow}>GESTIONE DOCUMENTI</span>
            <h1 className={styles.title}>Modifica preventivo</h1>
            <p className={styles.description}>
              Modifica i dati del cliente, le voci e le impostazioni del
              documento prima di salvarlo.
            </p>
          </div>
        </div>

        <div className={styles.status}>
          <span className={styles.statusDot} />
          Documento in modifica
        </div>
      </header>

      <section className={styles.editor}>
        <QuoteEditor
          key={quote.id}
          mode="edit"
          quote={quote}
          initialClient={client}
        />
      </section>

      <footer className={styles.footer}>
        <span>Prevo</span>
        <span>Preventivi chiari, lavoro più semplice.</span>
      </footer>
    </main>
  );
}
