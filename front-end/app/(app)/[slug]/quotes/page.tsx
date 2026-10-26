import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getQuotesAction } from "@/lib/Api/Quote/quote.action"; // adatta il path
import { QuotesList } from "@/components/app/DashboardComponents/Quotes/QuoteList/QuoteList";

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
    <main className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Preventivi
            </span>
          </div>
          <Link href={`/${slug}/quotes/create`} className={buttonVariants()}>
            <Plus data-icon="inline-start" />
            Crea preventivo
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
        <section>
          <p className="mb-2 text-sm font-medium text-primary">
            Workspace / Vendite
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Preventivi salvati
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestisci e monitora tutti i tuoi preventivi in un unico posto.
          </p>
        </section>

        <QuotesList
          key={currentPage}
          initialQuotes={quotes.data}
          slug={slug}
          currentPage={currentPage}
          lastPage={quotes.meta.last_page}
        />
        
      </div>
    </main>
  );
}
