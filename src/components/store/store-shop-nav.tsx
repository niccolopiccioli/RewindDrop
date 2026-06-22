"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/layout/locale-provider";
import { usePaths } from "@/hooks/use-paths";
import { stripLocaleFromPath } from "@/lib/i18n/routing";
import {
  getStoreNavigation,
  isStoreNavActive,
} from "@/lib/store-navigation";

export default function StoreShopNav({ sticky = true }: { sticky?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const paths = usePaths();
  const barePath = stripLocaleFromPath(pathname);

  if (barePath !== "/products") return null;

  const isAllActive =
    !searchParams.get("sort") &&
    !searchParams.get("gender") &&
    !searchParams.get("category") &&
    !searchParams.get("sale") &&
    !searchParams.get("q");

  const navigation = getStoreNavigation(locale);

  return (
    <nav
      aria-label="Shop sections"
      className={`${
        sticky
          ? "sticky top-16 lg:top-[5.25rem] z-30 -mx-4 px-4 sm:mx-0 sm:px-0 bg-white/90 backdrop-blur-xl border-b border-border/60"
          : ""
      }`}
    >
      <div className="overflow-x-auto overscroll-x-contain scrollbar-hide">
        <ul className="flex gap-1 sm:gap-2 min-w-max py-2 sm:py-2.5">
          <li>
            <Link
              href={paths.products}
              className={`relative inline-flex min-h-11 items-center px-4 sm:px-5 text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] whitespace-nowrap transition-colors duration-300 ${
                isAllActive
                  ? "text-foreground font-medium"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t("nav.all")}
              {isAllActive && (
                <span className="absolute inset-x-4 sm:inset-x-5 -bottom-2 h-px bg-foreground" />
              )}
            </Link>
          </li>
          {navigation.map((item) => {
            const active = isStoreNavActive(item, searchParams);

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`relative inline-flex min-h-11 items-center px-4 sm:px-5 text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] whitespace-nowrap transition-colors duration-300 ${
                    active
                      ? item.accent
                        ? "text-foreground font-semibold"
                        : "text-foreground font-medium"
                      : item.accent
                        ? "text-foreground/80 hover:text-foreground"
                        : "text-muted hover:text-foreground"
                  }`}
                >
                  {t(item.nameKey)}
                  {item.accent && !active && (
                    <span className="ml-1.5 text-[9px] tracking-widest text-muted/80">
                      %
                    </span>
                  )}
                  {active && (
                    <span className="absolute inset-x-4 sm:inset-x-5 -bottom-2 h-px bg-foreground" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
