import ClientForm from "@/components/app/DashboardComponents/Clients/ClientForm/ClientsForm";
import { updateClient } from "@/lib/Api/Clients/clients.actions";
import { getClientById, isErrorResult } from "@/lib/Api/Clients/clients.server";
import { toFormValues } from "@/lib/Utility/Clients/clients.mappers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

export async function UpdateClientContent({ params }: Props) {
  const { slug, id } = await params;

  const res = await getClientById(slug, id);
  if (isErrorResult(res)) return notFound();

  return (
    <>
      <ClientForm
        key={res.id}
        mode="update"
        defaultValues={toFormValues(res)}
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
