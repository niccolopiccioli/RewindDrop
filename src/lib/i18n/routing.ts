import { DEFAULT_LOCALE, type Locale } from "./types";

const LOCALE_PATTERN = /^\/(en|es|fr|it)(\/|$)/;

export function isLocalizedPath(pathname: string): boolean {
  return LOCALE_PATTERN.test(pathname);
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const match = pathname.match(/^\/(en|es|fr|it)(\/|$)/);
  return match ? (match[1] as Locale) : null;
}

export function stripLocaleFromPath(pathname: string): string {
  const stripped = pathname.replace(/^\/(en|es|fr|it)/, "");
  return stripped === "" ? "/" : stripped;
}

export function replaceLocaleInPath(pathname: string, locale: Locale): string {
  const base = stripLocaleFromPath(pathname);
  return base === "/" ? `/${locale}` : `/${locale}${base}`;
}

export function localizePath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") return `/${locale}`;
  if (isLocalizedPath(normalized)) {
    return replaceLocaleInPath(normalized, locale);
  }
  return `/${locale}${normalized}`;
}

export { DEFAULT_LOCALE };
