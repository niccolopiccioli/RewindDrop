"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/product-card";
import CategoryPills from "@/components/ui/category-pills";
import Button from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  featured?: boolean;
  images: { url: string; alt?: string | null }[];
  variants: { size?: string | null; stock: number }[];
  category: { name: string; slug: string };
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const sortOptions = [
  { value: "newest", label: "Più recenti" },
  { value: "price-asc", label: "Prezzo ↑" },
  { value: "price-desc", label: "Prezzo ↓" },
  { value: "name", label: "Nome A-Z" },
];

function ProdottiContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const category = searchParams.get("category");
  const sale = searchParams.get("sale");
  const gender = searchParams.get("gender");
  const q = searchParams.get("q");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (sale) params.set("sale", sale);
    if (gender) params.set("gender", gender);
    if (q) params.set("search", q);
    if (selectedSizes.length) params.set("sizes", selectedSizes.join(","));
    params.set("sort", selectedSort);
    params.set("page", String(page));
    params.set("limit", "12");
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotalPages(data.pagination?.totalPages ?? 1);
    setTotal(data.pagination?.total ?? 0);
    setLoading(false);
  }, [category, sale, gender, q, selectedSizes, selectedSort, page]);

  useEffect(() => {
    setPage(1);
  }, [category, sale, gender, q, selectedSizes, selectedSort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const title = q
    ? `Risultati per "${q}"`
    : category
      ? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Tutti i Prodotti";

  return (
    <div className="py-8 md:py-12">
      <div className="container-wide">
        <div className="mb-8">
          <Suspense fallback={null}>
            <CategoryPills />
          </Suspense>
        </div>

        <div className="flex items-end justify-between mb-8 md:mb-10 border-b border-border pb-6">
          <div>
            <h1 className="text-display text-2xl md:text-3xl font-semibold">{title}</h1>
            <p className="text-xs text-muted mt-2 uppercase tracking-widest">
              {total} prodotti
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 text-xs uppercase tracking-widest text-muted"
            >
              <SlidersHorizontal size={16} />
              Filtri
            </button>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="text-xs uppercase tracking-widest border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-10">
          <aside className={`${showFilters ? "fixed inset-0 z-50 bg-white p-6 overflow-auto" : "hidden"} lg:block lg:w-48 lg:flex-shrink-0`}>
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <span className="text-display text-sm font-semibold">Filtri</span>
              <button onClick={() => setShowFilters(false)}><X size={20} /></button>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted mb-3">Taglia</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() =>
                      setSelectedSizes((prev) =>
                        prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
                      )
                    }
                    className={`px-3 py-1.5 text-[10px] uppercase tracking-wider border transition-colors duration-300 ${
                      selectedSizes.includes(size)
                        ? "bg-foreground text-white border-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <Button
              className="mt-6 lg:hidden w-full"
              onClick={() => setShowFilters(false)}
            >
              Applica filtri
            </Button>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-surface mb-3" />
                    <div className="h-3 bg-surface w-3/4" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-muted text-sm py-16 text-center">Nessun prodotto trovato.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} badge={sale ? "sale" : null} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-12">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="p-2 border border-border disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs text-muted">
                      {page} / {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="p-2 border border-border disabled:opacity-30"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProdottiPageInner() {
  const searchParams = useSearchParams();
  return <ProdottiContent key={searchParams.toString()} />;
}

export default function ProdottiPage() {
  return (
    <Suspense fallback={<div className="container-wide py-16 text-muted text-sm">Caricamento...</div>}>
      <ProdottiPageInner />
    </Suspense>
  );
}
