import { notFound } from "next/navigation";
import { getQuoteAction } from "@/lib/Api/Quote/quote.action";
import { getClientById } from "@/lib/Api/Clients/clients.actions"; // adatta il nome reale
import QuoteEditor from "@/components/app/DashboardComponents/Quotes/QuoteEditor/QuoteEditor";

type EditQuotePageProps = {
  params: Promise<{ slug: string; id: string }>;
};

export default async function EditQuotePage({ params }: EditQuotePageProps) {
  const { slug, id } = await params;

  const quote = await getQuoteAction(slug, id);
  if (!quote) notFound();

  const client = quote.client_id
    ? await getClientById(slug, quote.client_id)
    : null;

  return (
    <main className="px-6 py-10 lg:px-8">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">
        Modifica preventivo
      </h1>
      <QuoteEditor
        key={quote.id}
        mode="edit"
        quote={quote}
        initialClient={client}
      />
    </main>
  );
}
