import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "./lib/Api/Auth/get-session-user";
import { Company } from "./types/company";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "prevo_session";

// Elenco delle rotte di sistema o pubbliche che NON devono essere considerate slug
const RESERVED_PATHS = [
  "login",
  "sign-up",
  "forgot-password",
  "reset-password",
  "api",
  "favicon.ico",
];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Estrae il primo segmento dell'URL (es. "/emanuele-impianti/settings" -> "emanuele-impianti")
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  // Se siamo nella root "/" o il primo segmento è una rotta riservata, lascia passare (o gestisci separatamente)
  if (!firstSegment || RESERVED_PATHS.includes(firstSegment)) {
    // Gestione opzionale: se l'utente è loggato e va su /login, reindirizzalo alla sua home
    if (["login", "sign-up"].includes(firstSegment)) {
      const hasCookie = request.cookies.has(SESSION_COOKIE);
      if (hasCookie) {
        const user = await getSessionUser(request.headers.get("cookie"));
        // Se ha un'azienda principale, potresti reindirizzarlo a user.companies[0].slug
        if (user && user.companies?.[0]) {
          return NextResponse.redirect(new URL(`/${user.companies[0].slug}`, request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // A questo punto, stiamo trattando "firstSegment" come uno SLUG aziendale (es. /emanuele-impianti)
  const slug = firstSegment;

  const hasCookie = request.cookies.has(SESSION_COOKIE);
  const cookie = request.headers.get("cookie");

  const user = hasCookie ? await getSessionUser(cookie) : null;

  // 1. Se l'utente non è loggato, blocca e manda al login con il parametro ?next=
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Se è loggato, verifica che l'utente abbia effettivamente accesso a questo slug
  const hasAccess = user.companies?.some((company: Company) => company.slug === slug);

  if (!hasAccess) {
    // Se non ha i permessi per questa azienda, reindirizzalo alla sua prima azienda valida o alla home
    const fallbackSlug = user.companies?.[0]?.slug;
    const redirectUrl = fallbackSlug ? `/${fallbackSlug}` : "/login";
    
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Utente loggato e autorizzato: procedi con la richiesta
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Intercetta tutte le richieste tranne:
     * - api (rotte API)
     * - _next/static (file statici di Next.js)
     * - _next/image (immagini ottimizzate)
     * - favicon.ico (icona del sito)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};