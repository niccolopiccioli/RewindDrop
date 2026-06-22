"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import ProductCard from "@/components/product/product-card";
import MediaImage from "@/components/ui/media-image";
import ProductBadge from "@/components/ui/product-badge";
import CategoryPills from "@/components/ui/category-pills";
import StoreShopNav from "@/components/store/store-shop-nav";
import ProductsHero from "@/components/store/products-hero";
import Button from "@/components/ui/button";
import { useI18n } from "@/components/layout/locale-provider";
import { usePaths } from "@/hooks/use-paths";

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

function ActiveFilters({
  selectedSizes,
  onRemoveSize,
  onClear,
}: {
  selectedSizes: string[];
  onRemoveSize: (size: string) => void;
  onClear: () => void;
}) {
  const { t } = useI18n();
  if (selectedSizes.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-[10px] uppercase tracking-widest text-muted mr-1">
        {t("products.activeFilters")}
      </span>
      {selectedSizes.map((size) => (
        <button
          key={size}
          type="button"
          onClick={() => onRemoveSize(size)}
          className="inline-flex items-center gap-1.5 min-h-9 px-3 text-[11px] uppercase tracking-wider bg-surface border border-border rounded-full hover:border-foreground transition-colors"
        >
          {t("products.size")} {size}
          <X size={12} />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-[11px] uppercase tracking-wider text-muted hover:text-foreground ml-1"
      >
        {t("products.clearAll")}
      </button>
    </div>
  );
}

function ProdottiContent() {
  const { t } = useI18n();
  const paths = usePaths();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState(
    () => searchParams.get("sort") || "newest"
  );
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
    setSelectedSort(searchParams.get("sort") || "newest");
    setPage(1);
  }, [category, sale, gender, q, searchParams]);

  useEffect(() => {
    setPage(1);
  }, [selectedSizes, selectedSort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const [featured, ...rest] = products;
  const showFeatured = !loading && featured && page === 1 && products.length >= 4;

  const sortOptions = [
    { value: "newest", label: t("products.sortNewest") },
    { value: "price-asc", label: t("products.sortPriceAsc") },
    { value: "price-desc", label: t("products.sortPriceDesc") },
    { value: "name", label: t("products.sortName") },
  ];

  return (
    <div className="pb-12 md:pb-16">
      <Suspense fallback={<div className="h-40 bg-foreground animate-pulse" />}>
        <ProductsHero total={total} />
      </Suspense>

      <div className="container-wide pt-4 sm:pt-6">
        <Suspense fallback={null}>
          <StoreShopNav />
        </Suspense>

        <div className="mt-6 mb-6">
          <Suspense fallback={null}>
            <CategoryPills />
          </Suspense>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden inline-flex items-center gap-2 min-h-11 px-4 text-xs uppercase tracking-widest border border-border rounded-full hover:border-foreground transition-colors"
            >
              <SlidersHorizontal size={15} />
              {t("products.filterSizes")}
              {selectedSizes.length > 0 && (
                <span className="min-w-[1.25rem] h-5 px-1 text-[10px] font-medium rounded-full bg-foreground text-white flex items-center justify-center">
                  {selectedSizes.length}
                </span>
              )}
            </button>
          </div>
          <label className="flex items-center gap-2 sm:ml-auto">
            <span className="text-[10px] uppercase tracking-widest text-muted shrink-0">
              {t("products.sort")}
            </span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="min-h-11 flex-1 sm:flex-none text-xs uppercase tracking-widest border border-border rounded-full px-4 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-foreground"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ActiveFilters
          selectedSizes={selectedSizes}
          onRemoveSize={(size) =>
            setSelectedSizes((prev) => prev.filter((s) => s !== size))
          }
          onClear={() => setSelectedSizes([])}
        />

        <div className="flex gap-10 lg:gap-12">
          {showFilters && (
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/30 lg:hidden animate-fade-in"
              onClick={() => setShowFilters(false)}
              aria-label="Chiudi filtri"
            />
          )}
          <aside
            className={`${
              showFilters
                ? "fixed inset-y-0 left-0 z-50 w-[min(100%,20rem)] bg-white p-6 overflow-auto safe-top safe-bottom animate-slide-in-left shadow-2xl"
                : "hidden"
            } lg:block lg:relative lg:w-52 lg:flex-shrink-0 lg:shadow-none lg:animate-none`}
          >
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <span className="text-display text-sm font-semibold">{t("products.filterSizes")}</span>
              <button
                onClick={() => setShowFilters(false)}
                className="touch-target flex items-center justify-center -mr-2"
                aria-label="Chiudi filtri"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-[11px] uppercase tracking-widest text-muted mb-4 hidden lg:block">
              {t("products.filterBySize")}
            </p>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    setSelectedSizes((prev) =>
                      prev.includes(size)
                        ? prev.filter((s) => s !== size)
                        : [...prev, size]
                    )
                  }
                  className={`min-h-11 min-w-[2.75rem] lg:w-full px-4 py-2.5 text-xs uppercase tracking-wider border transition-colors duration-300 ${
                    selectedSizes.includes(size)
                      ? "bg-foreground text-white border-foreground"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <Button
              className="mt-6 lg:hidden w-full"
              onClick={() => setShowFilters(false)}
            >
              {t("products.apply")}
            </Button>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-surface mb-3" />
                    <div className="h-3 bg-surface w-3/4" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-border">
                <p className="text-display text-lg font-semibold mb-2">
                  {t("products.noResults")}
                </p>
                <p className="text-sm text-muted mb-6">
                  {t("products.noResultsHint")}
                </p>
                <Link href={paths.products}>
                  <Button variant="outline" shape="pill">
                    {t("products.viewCatalog")}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {showFeatured && (
                  <Link
                    href={paths.product(featured.slug)}
                    className="group block mb-8 md:mb-10 overflow-hidden bg-surface card-hover-lift"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      <div className="relative aspect-[4/5] sm:aspect-auto sm:min-h-[380px] overflow-hidden">
                        <MediaImage
                          src={featured.images[0]?.url}
                          alt={featured.images[0]?.alt || featured.name}
                          fill
                          fit="cover"
                          imageWidth={800}
                          className="transition-transform duration-700 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        <div className="absolute top-4 left-4">
                          <ProductBadge
                            label={sale ? t("nav.sale") : t("common.new")}
                            variant={sale ? "sale" : "new"}
                          />
                        </div>
                      </div>
                      <div className="p-6 sm:p-10 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-border/60">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-3">
                          {t("products.featured")}
                        </p>
                        <h2 className="text-display text-xl sm:text-2xl md:text-3xl font-semibold leading-tight mb-3 group-hover:text-muted transition-colors">
                          {featured.name}
                        </h2>
                        <p className="text-xs uppercase tracking-widest text-muted mb-4">
                          {featured.category.name}
                        </p>
                        <p className="text-2xl font-medium tabular-nums mb-6">
                          €{Number(featured.price).toFixed(2)}
                        </p>
                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground">
                          {t("products.viewDetails")}
                          <ArrowUpRight
                            size={14}
                            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
                  {(showFeatured ? rest : products).map((p, index) => (
                    <div
                      key={p.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                    >
                      <ProductCard
                        product={p}
                        badge={sale ? "sale" : null}
                        cycleColors={index % 3 === 0}
                      />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 sm:gap-4 mt-12">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="touch-target flex items-center justify-center border border-border rounded-full disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs text-muted tabular-nums min-w-[4rem] text-center">
                      {page} / {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="touch-target flex items-center justify-center border border-border rounded-full disabled:opacity-30"
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

function ProductsPageLoading() {
  const { t } = useI18n();
  return (
    <div className="container-wide py-16 text-muted text-sm">
      {t("products.loading")}
    </div>
  );
}

export default function ProdottiPage() {
  return (
    <Suspense fallback={<ProductsPageLoading />}>
      <ProdottiPageInner />
    </Suspense>
  );
}
