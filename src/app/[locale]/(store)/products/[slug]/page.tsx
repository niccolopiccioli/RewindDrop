"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  Truck,
  Shield,
  Star,
  ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { uniqueSortedSizes } from "@/lib/sku";
import { type ColorOption, uniqueColors } from "@/lib/colors";
import ColorSwatches from "@/components/ui/color-swatches";
import ProductColorGallery from "@/components/product/product-color-gallery";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useI18n } from "@/components/layout/locale-provider";
import { usePaths } from "@/hooks/use-paths";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  sku: string;
  images: {
    id: string;
    url: string;
    alt?: string | null;
    objectFit?: string | null;
    colorHex?: string | null;
  }[];
  variants: {
    id: string;
    name: string;
    size?: string | null;
    color?: string | null;
    colorHex?: string | null;
    price?: number | null;
    stock: number;
  }[];
  category: { name: string; slug: string };
  reviews: { rating: number }[];
}

type Review = {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  user: { name: string | null };
  createdAt: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useI18n();
  const paths = usePaths();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchProduct();
  }, [params.slug]);

  useEffect(() => {
    if (!product) return;
    const inStock = product.variants.filter((v) => Number(v.stock) > 0);
    const sizes = uniqueSortedSizes(inStock.map((v) => v.size));
    const colors = uniqueColors(inStock, { inStockOnly: true });
    if (sizes.length === 1) setSelectedSize(sizes[0]);
    if (colors.length === 1) setSelectedColor(colors[0]);
  }, [product]);

  async function fetchProduct() {
    setSelectedSize(null);
    setSelectedColor(null);
    setQuantity(1);
    try {
      const [res, revRes] = await Promise.all([
        fetch(`/api/products/${params.slug}`),
        fetch(`/api/products/${params.slug}/reviews`),
      ]);
      const data = await res.json();
      const revData = await revRes.json();
      setProduct(data);
      setReviews(Array.isArray(revData) ? revData : []);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  }

  const availableSizes = uniqueSortedSizes(
    product?.variants
      .filter((v) => Number(v.stock) > 0)
      .map((v) => v.size) || []
  );

  const availableColors = uniqueColors(product?.variants ?? [], {
    inStockOnly: true,
  });

  const needsSize = availableSizes.length > 0;
  const needsColor = availableColors.length > 0;

  const selectedVariant = product?.variants.find((v) => {
    if (Number(v.stock) <= 0) return false;
    if (needsSize && v.size !== selectedSize) return false;
    if (needsColor && v.colorHex !== selectedColor?.colorHex) return false;
    return true;
  });

  const hasAnyStock =
    product?.variants.some((v) => Number(v.stock) > 0) ?? false;
  const isInStock = selectedVariant ? Number(selectedVariant.stock) > 0 : false;
  const canAddToCart =
    isInStock &&
    (!needsSize || selectedSize) &&
    (!needsColor || selectedColor);

  const addToCartLabel = (() => {
    if (!hasAnyStock) return t("product.soldOut");
    if (needsSize && !selectedSize) return t("product.selectSize");
    if (needsColor && !selectedColor) return t("product.selectColor");
    return t("product.addToCart");
  })();

  const averageRating = product?.reviews.length
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length
    : 0;

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url || "",
      size: selectedVariant.size || undefined,
      color: selectedVariant.color || undefined,
      colorHex: selectedVariant.colorHex || undefined,
      price: Number(selectedVariant.price || product.price),
      quantity,
      stock: selectedVariant.stock,
    });
  };

  if (loading) {
    return (
      <div className="container-wide py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7 aspect-[3/4] bg-surface animate-pulse" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-3 bg-surface w-1/4" />
            <div className="h-10 bg-surface w-3/4" />
            <div className="h-6 bg-surface w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-wide py-16 text-center">
        <h1 className="text-display text-xl">{t("product.notFound")}</h1>
      </div>
    );
  }

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(
          ((Number(product.comparePrice) - Number(product.price)) /
            Number(product.comparePrice)) *
            100
        )
      : null;

  return (
    <div className="pb-28 lg:pb-12">
      <div className="container-wide py-4 sm:py-6">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted overflow-x-auto scrollbar-hide"
        >
          <Link href={paths.home} className="hover:text-foreground shrink-0">
            {t("product.home")}
          </Link>
          <ChevronRight size={12} className="shrink-0 opacity-40" />
          <Link href={paths.products} className="hover:text-foreground shrink-0">
            {t("product.shop")}
          </Link>
          <ChevronRight size={12} className="shrink-0 opacity-40" />
          <Link
            href={paths.productsCategory(product.category.slug)}
            className="hover:text-foreground shrink-0"
          >
            {product.category.name}
          </Link>
          <ChevronRight size={12} className="shrink-0 opacity-40" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>
      </div>

      <div className="container-wide pb-8 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16">
          <div className="lg:col-span-7">
            <ProductColorGallery
              images={product.images}
              productName={product.name}
              price={Number(product.price)}
              comparePrice={
                product.comparePrice ? Number(product.comparePrice) : null
              }
              selectedColor={selectedColor}
            />
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6 sm:space-y-8">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted mb-2">
                  {product.category.name}
                </p>
                <h1 className="text-display text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight tracking-tight">
                  {product.name}
                </h1>

                {product.reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < Math.round(averageRating)
                              ? "fill-foreground text-foreground"
                              : "text-border"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted">
                      ({product.reviews.length})
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-medium tabular-nums">
                  €{Number(product.price).toFixed(2)}
                </span>
                {product.comparePrice && (
                  <>
                    <span className="text-sm text-muted line-through tabular-nums">
                      €{Number(product.comparePrice).toFixed(2)}
                    </span>
                    {discount && (
                      <span className="text-[10px] uppercase tracking-widest bg-foreground text-white px-2 py-1">
                        -{discount}%
                      </span>
                    )}
                  </>
                )}
              </div>

              <p className="text-[11px] uppercase tracking-widest text-muted">
                {t("product.sku")}: {product.sku}
              </p>

              {availableColors.length > 0 && (
                <div>
                  <ColorSwatches
                    colors={availableColors}
                    selectedHex={selectedColor?.colorHex}
                    selectedLabel={selectedColor?.color}
                    onSelect={setSelectedColor}
                  />
                </div>
              )}

              {availableSizes.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted mb-3">
                    {t("product.size")} — {selectedSize || t("product.select")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                      const variant = product.variants.find(
                        (v) =>
                          v.size === size &&
                          (!selectedColor ||
                            v.colorHex === selectedColor.colorHex)
                      );
                      const isAvailable =
                        variant && Number(variant.stock) > 0;
                      return (
                        <button
                          key={size}
                          onClick={() => isAvailable && setSelectedSize(size!)}
                          disabled={!isAvailable}
                          className={`min-w-[3rem] min-h-11 px-4 text-xs uppercase tracking-wider border transition-all duration-300 ${
                            selectedSize === size
                              ? "bg-foreground text-white border-foreground"
                              : isAvailable
                                ? "border-border hover:border-foreground"
                                : "border-border text-muted cursor-not-allowed line-through opacity-40"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted mb-3">
                  {t("product.quantity")}
                </p>
                <div className="inline-flex items-center border border-border rounded-full overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="touch-target flex items-center justify-center hover:bg-surface transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-sm font-medium tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(
                          Number(selectedVariant?.stock) || 10,
                          quantity + 1
                        )
                      )
                    }
                    className="touch-target flex items-center justify-center hover:bg-surface transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  fullWidth
                  size="lg"
                  shape="pill"
                  className="hidden lg:inline-flex"
                >
                  <ShoppingBag className="mr-2" size={18} />
                  {addToCartLabel}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  shape="pill"
                  className="px-5 min-w-12 touch-target"
                  onClick={async () => {
                    if (!session) {
                      router.push(paths.login);
                      return;
                    }
                    if (inWishlist) {
                      await fetch(`/api/wishlist?productId=${product.id}`, {
                        method: "DELETE",
                      });
                      setInWishlist(false);
                    } else {
                      await fetch("/api/wishlist", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productId: product.id }),
                      });
                      setInWishlist(true);
                    }
                  }}
                >
                  <Heart
                    size={18}
                    className={inWishlist ? "fill-foreground" : ""}
                  />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-muted bg-surface px-4 py-3">
                  <Truck size={16} strokeWidth={1.5} className="shrink-0" />
                  <span>{t("product.freeShipping")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted bg-surface px-4 py-3">
                  <Shield size={16} strokeWidth={1.5} className="shrink-0" />
                  <span>{t("product.returns")}</span>
                </div>
              </div>

              <details className="border-t border-border pt-6 group">
                <summary className="text-[11px] uppercase tracking-widest cursor-pointer list-none flex items-center justify-between">
                  {t("product.description")}
                  <span className="text-muted group-open:rotate-45 transition-transform text-lg leading-none">
                    +
                  </span>
                </summary>
                <p className="text-sm text-muted leading-relaxed mt-4 whitespace-pre-line">
                  {product.description}
                </p>
              </details>

              <div className="border-t border-border pt-6">
                <h3 className="text-[11px] uppercase tracking-widest text-muted mb-4">
                  {t("product.reviews")}
                </h3>
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted mb-4">
                    {t("product.noReviews")}
                  </p>
                ) : (
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-1">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="text-sm border-b border-border pb-4 last:border-0"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={
                                i < r.rating
                                  ? "fill-foreground text-foreground"
                                  : "text-border"
                              }
                            />
                          ))}
                          <span className="text-xs text-muted">
                            {r.user.name}
                          </span>
                        </div>
                        {r.comment && (
                          <p className="text-muted">{r.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {session ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await fetch(`/api/products/${params.slug}/reviews`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          rating: reviewRating,
                          comment: reviewComment,
                        }),
                      });
                      setReviewComment("");
                      fetchProduct();
                    }}
                    className="space-y-3"
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewRating(n)}
                          className="touch-target flex items-center justify-center"
                          aria-label={`${n} stars`}
                        >
                          <Star
                            size={16}
                            className={
                              n <= reviewRating
                                ? "fill-foreground text-foreground"
                                : "text-border"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <Input
                      label={t("product.comment")}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                    <Button type="submit" variant="outline" size="sm" shape="pill">
                      {t("product.submitReview")}
                    </Button>
                  </form>
                ) : (
                  <p className="text-xs text-muted">
                    <button
                      onClick={() => router.push(paths.login)}
                      className="underline hover:text-foreground"
                    >
                      {t("nav.signIn")}
                    </button>{" "}
                    {t("product.signInToReview")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-sticky-bar lg:hidden animate-slide-up">
        <div className="flex items-center justify-between gap-3 px-4 py-3 safe-x">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted truncate">
              {product.name}
            </p>
            <p className="text-lg font-semibold tabular-nums">
              €{Number(product.price).toFixed(2)}
            </p>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            shape="pill"
            size="lg"
            className="shrink-0"
          >
            <ShoppingBag className="mr-2" size={18} />
            <span className="hidden sm:inline">{addToCartLabel}</span>
            <span className="sm:hidden">{t("product.add")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
