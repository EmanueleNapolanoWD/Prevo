import { isAxiosError } from "axios";
import { NextResponse, type NextRequest } from "next/server";

import { authHeaders, serverApi } from "@/lib/Api/Services/server-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  const download = request.nextUrl.searchParams.get("download") === "1";

  const path = `/api/companies/${encodeURIComponent(slug)}/quotes/${encodeURIComponent(id)}/pdf${
    download ? "/download" : ""
  }`;

  try {
    const res = await serverApi.get(path, {
      headers: await authHeaders(),
      responseType: "arraybuffer",
      timeout: 60_000, // Cloudflare può metterci qualche secondo
    });

    return new Response(new Uint8Array(res.data), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          res.headers["content-disposition"] ??
          `${download ? "attachment" : "inline"}; filename="preventivo-${id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const status = isAxiosError(error) ? (error.response?.status ?? 502) : 500;

    if (status === 401) {
      return NextResponse.redirect(new URL("/login", request.url)); // ⚠️ path reale del login
    }

    const message =
      status === 403
        ? "Non hai i permessi per vedere questo preventivo."
        : status === 404
          ? "Preventivo non trovato."
          : "Impossibile generare il PDF. Riprova tra poco.";

    return new Response(message, {
      status: status >= 500 ? 502 : status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
