import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocaleProvider } from "@/components/layout/locale-provider";
import { t } from "@/lib/i18n";
import { LOCALES, type Locale } from "@/lib/i18n/types";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = (LOCALES.includes(locale as Locale) ? locale : "en") as Locale;

  const ogLocale =
    loc === "it" ? "it_IT" : loc === "es" ? "es_ES" : loc === "fr" ? "fr_FR" : "en_US";

  return {
    title: {
      default: `${SITE_NAME} - ${SITE_TAGLINE}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: t(loc, "meta.description"),
    keywords: t(loc, "meta.keywords").split(","),
    openGraph: {
      type: "website",
      locale: ogLocale,
      siteName: SITE_NAME,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!LOCALES.includes(locale as Locale)) {
    notFound();
  }

  return (
    <LocaleProvider initialLocale={locale as Locale}>{children}</LocaleProvider>
  );
}
