import { Suspense } from "react";
import Link from "next/link";
import getCompanySettings from "@/lib/Api/Services/Company/company.server";
import getCompany from "@/lib/Api/Services/Company/company.server"; // TODO: adatta al tuo service
import SettingsForm from "@/components/app/DashboardComponents/CompanySettings/SettingsForm";
//import CompanyForm from "@/components/app/DashboardComponents/CompanySettings/CompanyForm"; // TODO: adatta al tuo form
import styles from "./page.module.css";

const TABS = [
  { id: "azienda", label: "Impostazioni Azienda" },
  { id: "preventivi", label: "Impostazioni preventivi" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type CompanySettingsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

function resolveTab(value?: string): TabId {
  return TABS.some((t) => t.id === value) ? (value as TabId) : "azienda";
}

export default async function CompanySettingsPage({
  params,
  searchParams,
}: CompanySettingsPageProps) {
  const [{ slug }, { tab }] = await Promise.all([params, searchParams]);
  const activeTab = resolveTab(tab);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Impostazioni</h1>

      <nav className={styles.tabs} aria-label="Sezioni impostazioni">
        {TABS.map(({ id, label }) => (
          <Link
            key={id}
            href={`?tab=${id}`}
            replace
            scroll={false}
            className={`${styles.tab} ${activeTab === id ? styles.tabActive : ""}`}
            aria-current={activeTab === id ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>

      <section className={styles.panel}>
        <Suspense key={activeTab} fallback={<SettingsSkeleton />}>
          {activeTab === "azienda" ? (
            <CompanyContent slug={slug} />
          ) : (
            <QuotesContent slug={slug} />
          )}
        </Suspense>
      </section>
    </div>
  );
}

async function CompanyContent({ slug }: { slug: string }) {
  const company = await getCompany(slug);

  return <>Ciao</>
  // return <CompanyForm slug={slug} initialValues={company ?? undefined} />;
}

async function QuotesContent({ slug }: { slug: string }) {
  const settings = await getCompanySettings(slug);
  return <SettingsForm slug={slug} initialValues={settings ?? undefined} />;
}

function SettingsSkeleton() {
  return (
    <div className={styles.skeletonWrap}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.skeleton} />
      ))}
    </div>
  );
}