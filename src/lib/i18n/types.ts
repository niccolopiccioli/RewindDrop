export type Locale = "en" | "es" | "fr" | "it";

export const LOCALES: Locale[] = ["en", "es", "fr", "it"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

export type Messages = {
  [key: string]: string | Messages;
};
