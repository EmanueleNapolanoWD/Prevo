import ClientsForm from "@/components/app/DashboardComponents/Clients/ClientForm/ClientsForm";
import { createClient } from "@/lib/Api/Clients/clients.actions";
import styles from "./page.module.css";

export default async function CreateClientsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // server action con slug agganciato
  async function onSubmit(payload: Parameters<typeof createClient>[1]) {
    "use server";
    return createClient(slug, payload);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Nuovo contatto</h1>
      </header>
      {/* body */}
      <ClientsForm mode="create" onSubmit={onSubmit} />
    </div>
  );
}
