import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getClients } from "@/lib/Api/Clients/clients.actions";
import { ClientsToolbar } from "@/components/app/DashboardComponents/Clients/ClientList/ClientsToolbars";
import { ClientsTable } from "@/components/app/DashboardComponents/Clients/ClientList/ClientsTable";
import { ClientsPagination } from "@/components/app/DashboardComponents/Clients/ClientList/ClientsPagination";
import styles from "./page.module.css";

interface ClientsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; tipo?: string; page?: string }>;
}

export default async function ClientsPage({
  params,
  searchParams,
}: ClientsPageProps) {
  const { slug } = await params;
  const filters = await searchParams;
  const currentPage = Math.max(1, Number(filters.page) || 1);
  const result = await getClients(slug, {
    q: filters.q,
    tipo: filters.tipo,
    page: currentPage,
  });

  // Gestione degli errori restituiti da getClients().
  if ("ok" in result && result.ok === false) {
    return (
      <main className={styles.page}>
        <div className={styles.errorState} role="alert">
          <strong>Impossibile caricare i contatti</strong>
          <span>{result.message}</span>
        </div>
      </main>
    );
  }

  const clients = result.data ?? [];
  const lastPage = result.last_page ?? 1;
  const hasFilters = Boolean(filters.q || filters.tipo);

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>Rubrica clienti</div>
          <h1 className={styles.pageTitle}>Contatti</h1>
          <p className={styles.pageDescription}>
            Gestisci clienti, aziende e informazioni di contatto.
          </p>
        </div>
        <Button
          size="lg"
          className={styles.newButton}
          render={<Link href={`/${slug}/clients/create`} />}
        >
          <Plus data-icon="inline-start" />
          Nuovo contatto
        </Button>
      </header>

      <ClientsToolbar
        slug={slug}
        q={filters.q}
        tipo={filters.tipo}
        hasFilters={hasFilters}
      />

      <section className={styles.tableCard} aria-label="Elenco contatti">
        <div className={styles.tableHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Tutti i contatti</h2>
            <p className={styles.sectionMeta}>
              {clients.length} risultati in questa pagina
            </p>
          </div>
          <span className={styles.liveDot}>
            <span /> Sincronizzato
          </span>
        </div>
        {clients.length ? (
          <ClientsTable clients={clients} slug={slug} />
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>+</div>
            <h2>{hasFilters ? "Nessun risultato" : "Nessun contatto"}</h2>
            <p>
              {hasFilters
                ? "Prova a modificare o azzerare i filtri."
                : "Aggiungi il tuo primo contatto o importa un elenco esistente."}
            </p>
            <div>
              {hasFilters ? (
                <Button
                  variant="outline"
                  render={<Link href={`/${slug}/clients`} />}
                >
                  Azzera filtri
                </Button>
              ) : (
                <Button render={<Link href={`/${slug}/clients/create`} />}>
                  <Plus data-icon="inline-start" />
                  Nuovo contatto
                </Button>
              )}
            </div>
          </div>
        )}
        {lastPage > 1 && (
          <ClientsPagination
            slug={slug}
            q={filters.q}
            tipo={filters.tipo}
            currentPage={currentPage}
            lastPage={lastPage}
          />
        )}
      </section>
    </main>
  );
}
