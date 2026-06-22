"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { LOCALE_COOKIE, type Locale, DEFAULT_LOCALE } from "@/lib/i18n/types";
import { getMessages } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n";

function getLocaleCookie(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`));
  if (match) {
    const val = match.split("=")[1] as Locale;
    if (["en", "es", "fr", "it"].includes(val)) return val;
  }
  return DEFAULT_LOCALE;
}

type TFunction = (key: MessageKey, vars?: Record<string, string | number>) => string;

const AdminLocaleContext = createContext<{ locale: Locale; t: TFunction }>({
  locale: DEFAULT_LOCALE,
  t: (key: MessageKey) => key as string,
});

export function AdminLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocale(getLocaleCookie());
  }, []);

  const messages = getMessages(locale);

  const t: TFunction = (key, vars) => {
    const parts = key.split(".");
    let value: unknown = messages;
    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    if (typeof value !== "string") return key;
    if (!vars) return value;
    return Object.entries(vars).reduce(
      (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
      value
    );
  };

  return (
    <AdminLocaleContext.Provider value={{ locale, t }}>
      {children}
    </AdminLocaleContext.Provider>
  );
}

export function useAdminT() {
  const { t } = useContext(AdminLocaleContext);
  return (key: string, vars?: Record<string, string | number>) =>
    t(key as MessageKey, vars);
}

export function useAdminLocale() {
  return useContext(AdminLocaleContext).locale;
}
