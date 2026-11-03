import Link from "next/link";
import { Plus } from "lucide-react";
import { getQuotesAction } from "@/lib/Api/Quote/quote.action";
import { QuotesList } from "@/components/app/DashboardComponents/Quotes/QuoteList/QuoteList";
import { PageHeader } from "@/components/app/shared/PageHeader";
import { PageContainer } from "@/components/app/shared/PageContainer";

type QuotesPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function QuotesPage({
  params,
  searchParams,
}: QuotesPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const quotes = await getQuotesAction(slug, currentPage);

  return (
    <main className="flex flex-col min-h-[calc(100vh-77px)]">
      <PageContainer>
        <PageHeader
          title="Preventivi"
          description="Gestisci e monitora tutti i tuoi preventivi in un unico posto."
          actions={
            <Link
              href={`/${slug}/quotes/create`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
            >
              <Plus data-icon="inline-start" className="size-4" />
              Crea preventivo
            </Link>
          }
        />
        <QuotesList
          key={currentPage}
          initialQuotes={quotes.data}
          slug={slug}
          currentPage={currentPage}
          lastPage={quotes.meta.last_page}
        />
      </PageContainer>
    </main>
  );
}
