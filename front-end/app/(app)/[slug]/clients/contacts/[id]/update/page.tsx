import ClientForm from "@/components/app/DashboardComponents/Clients/ClientForm/ClientsForm";
import { getClientById, updateClient } from "@/lib/Api/Clients/clients.actions";
import { toFormValues } from "@/lib/Api/Clients/clients.mappers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

export async function UpdateClientContent({
  params,
}: Props) {
  const { slug, id } = await params;

  const result = await getClientById(slug, id);

  if (!("data" in result)) notFound();

  const client = result.data;

  return (
    <>
      <ClientForm
        key={client.id}
        mode="update"
        defaultValues={toFormValues(client)}
        onSubmit={updateClient.bind(null, slug, id)}
      />
    </>
  );
}

export default function UpdateClientPage({ params }: Props) {
  return (
    <Suspense fallback={<p>Caricamento…</p>}>
      <UpdateClientContent params={params} />
    </Suspense>
  );
}
