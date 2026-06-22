"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MediaImage from "@/components/ui/media-image";
import { Search, X } from "lucide-react";
import { usePaths } from "@/hooks/use-paths";
import { useI18n } from "@/components/layout/locale-provider";

type Product = {
  slug: string;
  name: string;
  price: number;
  images: { url: string }[];
};

type SearchDialogProps = {
  buttonClassName?: string;
};

export default function SearchDialog({ buttonClassName = "" }: SearchDialogProps) {
  const paths = usePaths();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`);
      const data = await res.json();
      setResults(data.products ?? []);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`p-2 rounded-full transition-colors ${buttonClassName || "text-muted hover:text-foreground"}`}
        aria-label={t("nav.search")}
      >
        <Search size={18} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="bg-white mx-auto mt-20 max-w-lg w-full mx-4 border border-border shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search size={18} className="text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search.placeholder")}
                className="flex-1 text-sm outline-none"
              />
              <button onClick={() => setOpen(false)} aria-label={t("common.close")}>
                <X size={18} />
              </button>
            </div>
            <div className="max-h-80 overflow-auto">
              {results.map((p) => (
                <Link
                  key={p.slug}
                  href={paths.product(p.slug)}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-surface transition-colors"
                >
                  <div className="relative w-12 h-14 bg-white border border-border flex-shrink-0 overflow-hidden">
                    <MediaImage
                      src={p.images[0]?.url}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                      iconClassName="w-4 h-4"
                    />
                  </div>
                  <div>
                    <p className="text-sm">{p.name}</p>
                    <p className="text-xs text-muted">€{Number(p.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
              {query && results.length === 0 && (
                <p className="p-4 text-sm text-muted">{t("search.noResults")}</p>
              )}
              {query && results.length > 0 && (
                <Link
                  href={paths.productsSearch(query)}
                  onClick={() => setOpen(false)}
                  className="block p-4 text-xs uppercase tracking-widest text-center border-t border-border hover:bg-surface"
                >
                  {t("search.viewAllResults")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
