"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import SearchDialog from "@/components/layout/search-dialog";
import SiteLogo from "@/components/ui/site-logo";
import { useState, useEffect, Suspense } from "react";
import { useCartStore } from "@/stores/cart";
import {
  getStoreNavigation,
  isStoreNavActive,
} from "@/lib/store-navigation";
import { useI18n } from "@/components/layout/locale-provider";
import { usePaths } from "@/hooks/use-paths";
import { stripLocaleFromPath } from "@/lib/i18n/routing";
import LocaleSwitcher from "@/components/layout/locale-switcher";

function NavLinks({
  isOverlay,
  onNavigate,
  className = "",
}: {
  isOverlay: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const barePath = stripLocaleFromPath(pathname);
  const navigation = getStoreNavigation(locale);

  return (
    <ul className={`flex items-center gap-1.5 xl:gap-2 ${className}`}>
      {navigation.map((item) => {
        const active =
          barePath === "/products" && isStoreNavActive(item, searchParams);

        return (
          <li key={item.id}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`relative inline-flex items-center min-h-10 px-3.5 xl:px-4 text-[11px] xl:text-xs font-bold uppercase tracking-[0.14em] xl:tracking-[0.16em] whitespace-nowrap rounded-full border transition-all duration-300 ${
                active
                  ? isOverlay
                    ? "text-white bg-white/25 border-white/45 shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
                    : "text-white bg-foreground border-foreground"
                  : isOverlay
                    ? "text-white border-white/40 bg-black/50 backdrop-blur-md hover:bg-black/60 hover:border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
                    : item.accent
                      ? "text-foreground border-border bg-white hover:border-foreground hover:bg-surface"
                      : "text-foreground/80 border-transparent bg-surface/80 hover:text-foreground hover:bg-surface hover:border-border"
              }`}
            >
              {t(item.nameKey)}
              {item.accent && !active && (
                <span
                  className={`ml-1.5 text-[9px] font-bold ${
                    isOverlay ? "text-white/70" : "text-foreground"
                  }`}
                >
                  %
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function HeaderActions({
  isOverlay,
  session,
  mounted,
  itemCount,
  paths,
}: {
  isOverlay: boolean;
  session: ReturnType<typeof useSession>["data"];
  mounted: boolean;
  itemCount: number;
  paths: ReturnType<typeof usePaths>;
}) {
  const { t } = useI18n();
  const iconBtn = isOverlay
    ? "text-white border border-white/25 bg-black/25 backdrop-blur-md hover:bg-black/40 hover:border-white/40"
    : "text-muted border border-transparent hover:text-foreground hover:bg-surface";

  return (
    <div className="flex items-center justify-end gap-1 sm:gap-1.5">
      <SearchDialog buttonClassName={iconBtn} />

      <Link
        href={session ? paths.account : paths.login}
        className={`touch-target flex items-center justify-center rounded-full transition-colors ${iconBtn}`}
        aria-label={t("nav.account")}
      >
        <User size={19} strokeWidth={1.5} />
      </Link>

      <Link
        href={paths.cart}
        className={`relative touch-target flex items-center justify-center rounded-full transition-colors ${iconBtn}`}
        aria-label={t("nav.cart")}
      >
        <ShoppingBag size={19} strokeWidth={1.5} />
        {mounted && itemCount > 0 && (
          <span
            className={`absolute top-0.5 right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 text-[10px] font-semibold rounded-full flex items-center justify-center leading-none ${
              isOverlay ? "bg-white text-foreground" : "bg-foreground text-white"
            }`}
          >
            {itemCount}
          </span>
        )}
      </Link>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t, locale } = useI18n();
  const paths = usePaths();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());
  const navigation = getStoreNavigation(locale);

  const barePath = stripLocaleFromPath(pathname);
  const isHome = barePath === "/";
  const isOverlay = isHome && !scrolled;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setScrolled(false);
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const menuBtnClass = isOverlay
    ? "text-white border border-white/25 bg-black/25 backdrop-blur-md hover:bg-black/40"
    : "text-muted border border-transparent hover:text-foreground hover:bg-surface";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-500 ease-out ${
          isOverlay
            ? "bg-transparent border-b border-transparent"
            : "bg-white/95 backdrop-blur-md border-b border-border/40"
        }`}
      >
        <div className="container-wide">
          <div className="grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center h-16 lg:h-[5.25rem] gap-3 lg:gap-6">
          <div className="flex items-center min-w-0">
            <Link
              href={paths.home}
              className={`shrink-0 transition-opacity duration-300 hover:opacity-90 ${
                isOverlay ? "text-white" : "text-foreground"
              }`}
              aria-label="RewindDrop — Home"
            >
              <SiteLogo size="nav" />
            </Link>
          </div>

          <nav className="hidden lg:flex justify-center" aria-label="Main navigation">
            <Suspense fallback={null}>
              <NavLinks isOverlay={isOverlay} />
            </Suspense>
          </nav>

          <div className="flex items-center justify-end gap-1 sm:gap-1.5">
            <HeaderActions
              isOverlay={isOverlay}
              session={session}
              mounted={mounted}
              itemCount={itemCount}
              paths={paths}
            />
            <button
              type="button"
              className={`lg:hidden touch-target flex items-center justify-center rounded-full transition-colors ${menuBtnClass}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={t("nav.menu")}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X size={22} strokeWidth={1.5} />
              ) : (
                <Menu size={22} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden animate-fade-in backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={t("common.close")}
          />
          <div className="lg:hidden fixed inset-y-0 right-0 z-50 w-[min(100%,20rem)] flex flex-col bg-white shadow-2xl animate-slide-in-right safe-top safe-bottom">
            <div className="flex items-center justify-between px-5 h-16 border-b border-border/60">
              <SiteLogo size="compact" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="touch-target flex items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-surface"
                aria-label={t("common.close")}
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Mobile menu">
              <p className="px-3 mb-3 text-[10px] uppercase tracking-[0.3em] text-muted">
                {t("nav.menu")}
              </p>
              <ul className="space-y-1">
                <li>
                  <Link
                    href={paths.products}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center min-h-12 px-3 text-sm uppercase tracking-[0.15em] text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors"
                  >
                    {t("nav.all")}
                  </Link>
                </li>
                {navigation.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between min-h-12 px-3 text-sm uppercase tracking-[0.15em] rounded-lg transition-colors ${
                        item.accent
                          ? "text-foreground font-medium hover:bg-surface"
                          : "text-muted hover:text-foreground hover:bg-surface"
                      }`}
                    >
                      {t(item.nameKey)}
                      {item.accent && (
                        <span className="text-[10px] tracking-widest text-muted">{t("nav.sale")}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-border/60 px-5 py-5 space-y-4 safe-bottom">
              <Link
                href={session ? paths.account : paths.login}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 min-h-11 text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground"
              >
                <User size={17} strokeWidth={1.5} />
                {session ? t("nav.myAccount") : t("nav.signIn")}
              </Link>
              <LocaleSwitcher className="w-full justify-center" />
            </div>
          </div>
        </>
      )}
      </header>

      {!isHome && (
        <div className="h-16 lg:h-[5.25rem] shrink-0" aria-hidden />
      )}
    </>
  );
}
