import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "./lib/Api/get-session-user";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "laravel-session";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isAuthenticated = request.cookies.get("laravel-session");

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password");
  const isProtected = pathname.startsWith("/dashboard");

  // soft control - se non ha cookie non parte richiesta
  const hasCookie = request.cookies.has(SESSION_COOKIE);
  const user = hasCookie
    ? await getSessionUser(request.headers.get("cookie"))
    : null;

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login/:path*", "/sign-up/:path*", "/dashboard/:path*"],
};
