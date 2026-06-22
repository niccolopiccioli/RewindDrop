"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "@/components/layout/locale-provider";
import { LOCALES, type Locale } from "@/lib/i18n/types";

const LABELS: Record<Locale, string> = {
  en: "EN",
  it: "IT",
  es: "ES",
  fr: "FR",
};

export default function LocaleSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const pathname = usePathname();

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-border p-0.5 ${className}`}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-current={locale === code ? "true" : undefined}
          className={`min-h-8 min-w-9 px-2 text-[10px] font-medium uppercase tracking-wider rounded-full transition-colors ${
            locale === code
              ? "bg-foreground text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
}
