import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { verifyAuthToken } from "@/lib/jwt";

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];

function stripLocale(pathname: string): { locale: string | null; rest: string } {
  const match = pathname.match(/^\/(uz|en|ru)(\/.*)?$/);
  if (match) return { locale: match[1], rest: match[2] || "/" };
  return { locale: null, rest: pathname };
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/confirm" || pathname.startsWith("/confirm/")) {
    return NextResponse.next();
  }

  const { locale, rest } = stripLocale(pathname);
  const isPublic = PUBLIC_PATHS.some((p) => rest.startsWith(p));
  const token = request.cookies.get("session")?.value;

  const rawPayload = token ? await verifyAuthToken(token) : null;
  const payload =
    rawPayload && typeof rawPayload.userId === "string" && /^[a-f0-9]{24}$/i.test(rawPayload.userId)
      ? rawPayload
      : null;

  if (!isPublic && !payload) {
    const loginPath = locale ? `/${locale}/login` : "/login";
    const response = NextResponse.redirect(new URL(loginPath, request.url));
    if (token) response.cookies.delete("session");
    return response;
  }

  if (isPublic && payload && rest.startsWith("/login")) {
    const homePath = locale ? `/${locale}` : "/";
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};