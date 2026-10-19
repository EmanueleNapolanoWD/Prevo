import Link from 'next/link';
import styles from './page.module.css';

export default function ClientsPage() {
  return (
    <>
      <h1 className={styles.title}>Contatti</h1>

      {/* LISTA CONTATTI */}
      <div className={styles.toolbar}>
        {/* Search bar con filtri (GET: i valori finiscono nei searchParams) */}
        <form className={styles.search} role="search" action="" method="get">
          <input
            className={styles.input}
            type="search"
            name="q"
            placeholder="Cerca contatti"
            aria-label="Cerca contatti"
          />
          <select className={styles.select} name="tipo" defaultValue="" aria-label="Tipo contatto">
            <option value="">Tutti i tipi</option>
            <option value="person">Persone</option>
            <option value="company">Aziende</option>
          </select>
          <select className={styles.select} name="gruppo" defaultValue="" aria-label="Gruppo">
            <option value="">Tutti i gruppi</option>
            {/* TODO: gruppi caricati dall'API */}
          </select>
          <button type="submit" className={styles.secondary}>
            Filtra
          </button>
        </form>

        {/* Nuovo contatto + importa / esporta */}
        <div className={styles.actions}>
          {/* <details> evita un client component per il menu */}
          <details className={styles.menu}>
            <summary className={styles.secondary}>Importa / Esporta</summary>
            <div className={styles.menuList}>
              <Link href="clients/import" className={styles.menuItem}>
                Importa contatti
              </Link>
              <Link href="/api/clients/export" className={styles.menuItem}>
                Esporta contatti
              </Link>
            </div>
          </details>

          <Link href="clients/new" className={styles.primary}>
            Nuovo contatto
          </Link>
        </div>
      </div>

      {/* BODY */}
      <div className={styles.body}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Numero</th>
              <th scope="col">Nome</th>
              <th scope="col">E-mail</th>
              <th scope="col">Telefono</th>
              <th scope="col">Città</th>
            </tr>
          </thead>
          <tbody>{/* TODO: righe dei contatti */}</tbody>
        </table>

        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Nessun contatto</p>
          <p className={styles.emptyText}>Aggiungi il tuo primo contatto o importa un elenco esistente.</p>
          <Link href="clients/new" className={styles.primary}>
            Nuovo contatto
          </Link>
        </div>
      </div>
    </>
  );
}