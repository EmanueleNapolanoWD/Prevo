import ClientsForm from "@/components/app/DashboardComponents/Clients/ClientForm/ClientsForm";
import { createClient } from "@/lib/Api/Clients/clients.actions";
import styles from "./page.module.css";

export default async function CreateClientsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Nuovo contatto</h1>
      </header>

      {/* createClient è già una server action: bind aggancia lo slug come primo argomento */}
      <ClientsForm mode="create" onSubmit={createClient.bind(null, slug)} />
    </div>
  );
}
