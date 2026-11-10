import styles from "./page.module.css";
import { getCurrentUser } from "@/lib/Api/Auth/auth.server";
import { SupportPage } from "@/components/app/DashboardComponents/Support/SupportPage";

export default async function HelpPage() {
  const { email } = await getCurrentUser();

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className="eyebrow">Supporto</div>
          <h1 className={styles.pageTitle}>Supporto</h1>
        </div>
      </header>

      <main>
        <SupportPage userEmail={email} />
      </main>
    </div>
  );
}
