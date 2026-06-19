"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import SearchDialog from "@/components/layout/search-dialog";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/stores/cart";

const navigation = [
  { name: "Nuovi Arrivi", href: "/prodotti?sort=newest" },
  { name: "Uomo", href: "/prodotti?gender=men" },
  { name: "Donna", href: "/prodotti?gender=women" },
  { name: "Accessori", href: "/prodotti?category=cappelli" },
  { name: "Offerte", href: "/prodotti?sale=true", accent: true },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());

  const isHome = pathname === "/";
  const isOverlay = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinkClass = isOverlay
    ? "text-white/75 hover:text-white"
    : "text-muted hover:text-foreground";

  const iconButtonClass = isOverlay
    ? "text-white/80 hover:text-white hover:bg-white/10"
    : "text-muted hover:text-foreground hover:bg-surface";

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-500 ease-out ${
        isOverlay
          ? "border-b border-white/0 bg-transparent"
          : scrolled
            ? "glass-header border-b border-black/[0.06] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)]"
            : "border-b border-border/50 bg-white"
      }`}
    >
      <div className="container-wide">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-3 z-10 min-w-0">
            <button
              type="button"
              className={`lg:hidden p-2 -ml-2 rounded-full transition-colors ${iconButtonClass}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X size={20} strokeWidth={1.5} />
              ) : (
                <Menu size={20} strokeWidth={1.5} />
              )}
            </button>

            <Link
              href="/"
              className={`font-display text-sm font-semibold uppercase tracking-[0.28em] shrink-0 transition-colors duration-300 ${
                isOverlay ? "text-white" : "text-foreground"
              }`}
            >
              ESHOP
            </Link>
          </div>

          <nav
            className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"
            aria-label="Navigazione principale"
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative py-1 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-300 ${navLinkClass} ${
                  item.accent && !isOverlay ? "text-foreground" : ""
                } ${item.accent && isOverlay ? "text-white" : ""}`}
              >
                {item.name}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 ease-out group-hover:w-full ${
                    isOverlay ? "bg-white" : "bg-foreground"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 z-10">
            <SearchDialog buttonClassName={iconButtonClass} />

            <Link
              href={session ? "/account" : "/login"}
              className={`p-2 rounded-full transition-colors ${iconButtonClass}`}
              aria-label="Account"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>

            <Link
              href="/carrello"
              className={`relative p-2 rounded-full transition-colors ${iconButtonClass}`}
              aria-label="Carrello"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span
                  className={`absolute top-0.5 right-0.5 min-w-[1rem] h-4 px-1 text-[10px] font-medium rounded-full flex items-center justify-center ${
                    isOverlay ? "bg-white text-foreground" : "bg-foreground text-white"
                  }`}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="lg:hidden relative z-50 border-t border-black/5 bg-white/95 backdrop-blur-xl"
            >
              <nav className="container-wide py-6" aria-label="Menu mobile">
                <ul className="space-y-1">
                  {navigation.map((item, i) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between py-3.5 text-xs uppercase tracking-[0.2em] transition-colors border-b border-border/40 last:border-0 ${
                          item.accent
                            ? "text-foreground font-medium"
                            : "text-muted hover:text-foreground"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                        {item.accent && (
                          <span className="text-[9px] tracking-widest text-muted">Sale</span>
                        )}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
