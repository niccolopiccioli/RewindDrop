"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Store, X, Warehouse, MessageSquare, LayoutTemplate } from "lucide-react";
import { useState, useEffect } from "react";
import SiteLogo from "@/components/ui/site-logo";
import { useAdminT, useAdminLocale } from "./admin-locale-provider";
import { LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/i18n/types";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  it: "IT",
  es: "ES",
  fr: "FR",
};

const navItems = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { key: "products", href: "/admin/products", icon: Package },
  { key: "categories", href: "/admin/categorie", icon: FolderTree },
  { key: "homepage", href: "/admin/homepage", icon: LayoutTemplate },
  { key: "orders", href: "/admin/ordini", icon: ShoppingCart },
  { key: "inventory", href: "/admin/inventario", icon: Warehouse },
  { key: "reviews", href: "/admin/recensioni", icon: MessageSquare },
];

function setAdminLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
  window.location.reload();
}

function NavLinks({ onNavigate, t }: { onNavigate?: () => void; t: (key: string) => string }) {
  const pathname = usePathname();
  const sidebarT = (k: string) => t(`admin.sidebar.${k}`);
  const locale = useAdminLocale();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs uppercase tracking-widest transition-colors ${
              isActive ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon size={16} strokeWidth={1.5} />
            {sidebarT(item.key)}
          </Link>
        );
      })}
      <div className="pt-4 mt-4 border-t border-white/10">
        <div
          className="inline-flex items-center gap-0.5 rounded-full border border-white/10 p-0.5"
          role="group"
          aria-label="Language"
        >
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setAdminLocale(code)}
              aria-current={locale === code ? "true" : undefined}
              className={`min-h-7 min-w-8 px-2 text-[10px] font-medium uppercase tracking-wider rounded-full transition-colors ${
                locale === code
                  ? "bg-white text-[#1d1d1f]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {LOCALE_LABELS[code]}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useAdminT();

  useEffect(() => {
    function handler() { setMobileOpen(true); }
    window.addEventListener("admin:open-mobile-menu", handler);
    return () => window.removeEventListener("admin:open-mobile-menu", handler);
  }, []);

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:h-full lg:flex-shrink-0 bg-[#1d1d1f] text-white">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="block text-white">
            <SiteLogo size="compact" className="text-white" />
            <span className="mt-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
              {t("admin.title")}
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4"><NavLinks t={t} /></div>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors">
            <Store size={14} /> {t("admin.sidebar.goToShop")}
          </Link>
        </div>
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)}>
          <aside className="w-64 h-full bg-[#1d1d1f] text-white flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex justify-between items-center border-b border-white/10">
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">{t("admin.title")}</span>
              <button onClick={() => setMobileOpen(false)} aria-label={t("admin.common.close")}><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4"><NavLinks onNavigate={() => setMobileOpen(false)} t={t} /></div>
          </aside>
        </div>
      )}
    </>
  );
}