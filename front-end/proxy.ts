import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "./lib/Api/get-session-user";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "laravel-session";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password");
  const isProtected = pathname.startsWith("/dashboard");

  const hasCookie = request.cookies.has(SESSION_COOKIE);

  const cookie = request.headers.get("cookie");

  const user = hasCookie
    ? await getSessionUser(cookie)
    : null;

  console.log("[proxy]", pathname, {
    cookies: request.cookies.getAll().map((c) => c.name),
    expected: SESSION_COOKIE,
    hasCookie,
    user: !!user,
  });
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
  matcher: [
    "/login/:path*",
    "/sign-up/:path*",
    "/forgot-password/:path*",
    "/dashboard/:path*",
  ],
};
