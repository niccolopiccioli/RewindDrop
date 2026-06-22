"use client";

import { useSearchParams } from "next/navigation";
import { useI18n } from "@/components/layout/locale-provider";
import { resolveProductsPageKey } from "@/lib/store-navigation";

export default function ProductsHero({ total }: { total: number }) {
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const pageKey = resolveProductsPageKey(searchParams);
  const isSale = searchParams.get("sale") === "true";
  const q = searchParams.get("q");
  const category = searchParams.get("category");

  const eyebrow = t(`products.pages.${pageKey}.eyebrow` as never);
  let title = t(`products.pages.${pageKey}.title` as never);
  const subtitle = t(`products.pages.${pageKey}.subtitle` as never);

  if (pageKey === "search" && q) {
    title = `“${q}”`;
  }
  if (pageKey === "category" && category) {
    title = category
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <header className="relative overflow-hidden bg-foreground text-white -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative container-wide py-8 sm:py-10 md:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-white/50 mb-3">
              {eyebrow}
            </p>
            <h1 className="text-display text-[clamp(1.75rem,6vw,3rem)] font-semibold leading-[0.95] tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 text-sm sm:text-base text-white/55 max-w-md leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {isSale && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse-soft" />
                {t("products.onSale")}
              </span>
            )}
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-0.5">
                {t("products.catalog")}
              </p>
              <p className="text-2xl sm:text-3xl font-medium tabular-nums">
                {total}
                <span className="text-sm font-normal text-white/50 ml-1.5">
                  {t("products.pieces")}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
