import {
  DEFAULT_LOCALE,
  LOCALES,
  type Locale,
} from "./types";

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const tags = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: qPart ? parseFloat(qPart) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    const primary = tag.split("-")[0];
    if (isLocale(primary)) return primary;
    if (tag.startsWith("es")) return "es";
    if (tag.startsWith("fr")) return "fr";
    if (tag.startsWith("it")) return "it";
    if (tag.startsWith("en")) return "en";
  }

  return DEFAULT_LOCALE;
}

export { DEFAULT_LOCALE, LOCALES, type Locale };
