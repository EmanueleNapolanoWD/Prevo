import { Suspense } from "react";
import Link from "next/link";
import { FilePlus2, ChevronRight } from "lucide-react";

import QuoteEditor from "@/components/app/DashboardComponents/Quotes/QuoteEditor/QuoteEditor";
import styles from "./page.module.css";

export default function NewQuotePage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href="./.." className={styles.breadcrumbLink}>
            Preventivi
          </Link>

          <ChevronRight size={15} aria-hidden="true" />

          <span aria-current="page">Nuovo preventivo</span>
        </nav>

        <header className={styles.header}>
          <div className={styles.heading}>
            <div className={styles.icon}>
              <FilePlus2 size={23} strokeWidth={1.8} />
            </div>

            <div>
              <span className={styles.eyebrow}>GESTIONE DOCUMENTI</span>
              <h1 className={styles.title}>Crea un preventivo</h1>
              <p className={styles.description}>
                Compila i dati del cliente, aggiungi le voci e personalizza
                il documento prima di salvarlo.
              </p>
            </div>
          </div>

          <div className={styles.status}>
            <span className={styles.statusDot} />
            Nuovo documento
          </div>
        </header>

        <section className={styles.editor}>
          <Suspense
            fallback={
              <div className={styles.loading} role="status">
                <span className={styles.spinner} />
                <span>Preparazione del modulo...</span>
              </div>
            }
          >
            <QuoteEditor />
          </Suspense>
        </section>

        <footer className={styles.footer}>
          <span>Prevo</span>
          <span>Preventivi chiari, lavoro più semplice.</span>
        </footer>
      </div>
    </main>
  );
}