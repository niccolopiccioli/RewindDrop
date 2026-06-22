import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { detectLocale } from "@/lib/i18n/detect";
import {
  getLocaleFromPath,
  isLocalizedPath,
  localizePath,
  stripLocaleFromPath,
} from "@/lib/i18n/routing";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/types";

const { auth } = NextAuth(authConfig);
const LEGACY_REDIRECTS: Record<string, string> = {
  "/prodotti": "/products",
  "/carrello": "/cart",
  "/spedizioni": "/shipping",
  "/resi": "/returns",
  "/account/indirizzi": "/account/addresses",
  "/account/ordini": "/account/orders",
  "/account/profilo": "/account/profile",
};

function resolveLocale(req: Request, pathname: string): Locale {
  const fromPath = getLocaleFromPath(pathname);
  if (fromPath) return fromPath;

  const cookie = req.headers
    .get("cookie")
    ?.split("; ")
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];

  if (cookie === "en" || cookie === "es" || cookie === "fr" || cookie === "it") {
    return cookie;
  }

  return detectLocale(req.headers.get("accept-language"));
}

function withLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const locale = resolveLocale(req, pathname);

  if (!isLocalizedPath(pathname) && !pathname.startsWith("/admin")) {
    let targetPath = pathname;

    if (pathname === "/") {
      targetPath = `/${locale}`;
    } else if (pathname.startsWith("/ordine/")) {
      targetPath = localizePath(locale, pathname.replace("/ordine/", "/order/"));
    } else if (pathname.startsWith("/prodotti/")) {
      targetPath = localizePath(
        locale,
        pathname.replace("/prodotti/", "/products/")
      );
    } else {
      for (const [legacy, modern] of Object.entries(LEGACY_REDIRECTS)) {
        if (pathname === legacy || pathname.startsWith(`${legacy}/`)) {
          targetPath = localizePath(
            locale,
            pathname.replace(legacy, modern)
          );
          break;
        }
      }
      if (targetPath === pathname && !pathname.startsWith("/admin")) {
        targetPath = localizePath(locale, pathname);
      }
    }

    if (targetPath !== pathname) {
      const url = req.nextUrl.clone();
      url.pathname = targetPath;
      return withLocaleCookie(NextResponse.redirect(url), locale);
    }
  }

  const pathLocale = getLocaleFromPath(pathname);
  const barePath = stripLocaleFromPath(pathname);
  const isLoggedIn = !!req.auth;

  if (barePath.startsWith("/account")) {
    if (!isLoggedIn) {
      const loginUrl = new URL(localizePath(pathLocale ?? locale, "/login"), req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return withLocaleCookie(NextResponse.redirect(loginUrl), pathLocale ?? locale);
    }
    return withLocaleCookie(NextResponse.next(), pathLocale ?? locale);
  }

  if (pathname.startsWith("/api/account")) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isAdminRoute) {
    return pathLocale
      ? withLocaleCookie(NextResponse.next(), pathLocale)
      : NextResponse.next();
  }

  if (!isLoggedIn) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL(localizePath(locale, "/login"), req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("admin", "1");
    return withLocaleCookie(NextResponse.redirect(loginUrl), locale);
  }

  if (req.auth?.user?.role !== "ADMIN") {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return withLocaleCookie(
      NextResponse.redirect(new URL(localizePath(locale, "/"), req.url)),
      locale
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
