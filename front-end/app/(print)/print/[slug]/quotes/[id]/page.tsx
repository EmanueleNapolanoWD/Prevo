import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import PrintQuote from "./PrintQuote";
import { serverApi } from "@/lib/Api/Services/server-api";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function secretOk(received: string | null) {
  const expected = process.env.PRINT_SECRET ?? "";
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function PrintQuotePage({ params, searchParams }: Props) {
  const { slug, id } = await params;
  const sp = await searchParams;

  if (!secretOk((await headers()).get("x-print-secret"))) notFound();

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") qs.set(k, v);
  }

  const url = `${process.env.API_URL}/api/companies/${encodeURIComponent(slug)}/quotes/${encodeURIComponent(id)}/print?${qs}`;
  const res = await serverApi.get(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (res.status < 200 || res.status >= 300)
    throw new Error(`print-data ha risposto ${res.status}`);

  const data = res.data; // { quote, company, settings }

  return <PrintQuote data={data} />;
}
