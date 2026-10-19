import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/Api/Auth/auth.server";

import { AppSidebar } from "@/components/app/DashboardUI/app-sidebar";
import { SiteHeader } from "@/components/app/DashboardUI/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

async function SidebarLoader({ params }: { params: Props["params"] }) {
  const { slug } = await params;
  const { companies, ...user } = await getCurrentUser();

  console.log('slug: ', slug)
  console.log('user: ', user)
  console.log('comapnies: ', companies)

  const company = companies.find((c) => c.slug === slug);
  if (!company) notFound(); // non sei membro di questa azienda (o non esiste)

  return (
    <AppSidebar variant="inset" slug={slug} user={user} company={company} />
  );
}

export default function AppLayout({ children, params }: Props) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Suspense
        fallback={<div className="hidden w-(--sidebar-width) md:block" />}
      >
        <SidebarLoader params={params} />
      </Suspense>
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}