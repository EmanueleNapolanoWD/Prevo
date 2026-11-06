import { Suspense } from "react";
import Link from "next/link";
import { getQuoteSettingsAction } from "@/lib/Api/QuoteSettings/quote-settings.action";
import { fetchCompany } from "@/lib/Api/Company/company.server";
import { companyToValues } from "@/lib/Utility/Companies/companies.mapper";
import QuoteSettingsForm from "@/components/app/DashboardComponents/Settings/QuoteSettings/QuoteSettingsForm";
import CompanyForm from "@/components/app/DashboardComponents/Settings/CompanyForm/CompanyForm";
import styles from "./page.module.css";

const TABS = [
  { id: "azienda", label: "Impostazioni Azienda" },
  { id: "preventivi", label: "Impostazioni preventivi" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ tab?: string }>;

type CompanySettingsPageProps = {
  params: Params;
  searchParams: SearchParams;
};

function resolveTab(value?: string): TabId {
  return TABS.find((t) => t.id === value)?.id ?? "azienda";
}

// Nessun await qui: la shell (titolo + fallback) viene prerenderizzata
export default function CompanySettingsPage({
  params,
  searchParams,
}: CompanySettingsPageProps) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Impostazioni</h1>

      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsTabs params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SettingsTabs({
  params,
  searchParams,
}: CompanySettingsPageProps) {
  const [{ slug }, { tab }] = await Promise.all([params, searchParams]);
  const activeTab = resolveTab(tab);

  return (
    <>
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
    </>
  );
}

async function CompanyContent({ slug }: { slug: string }) {
  const company = await fetchCompany(slug);
  return (
    <CompanyForm
      key={company.updated_at}
      slug={slug}
      initialValues={companyToValues(company)}
    />
  );
}

async function QuotesContent({ slug }: { slug: string }) {
  const settings = await getQuoteSettingsAction(slug);
  return <QuoteSettingsForm slug={slug} initialValues={settings} />;
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
