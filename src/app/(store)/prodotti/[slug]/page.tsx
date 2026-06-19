"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MediaImage from "@/components/ui/media-image";
import { Minus, Plus, ShoppingBag, Heart, Truck, Shield, Star } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

type ColorOption = { color: string | null | undefined; colorHex: string | null | undefined };

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  sku: string;
  images: { id: string; url: string; alt?: string | null }[];
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
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
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
    const sizes = [
      ...new Set(inStock.filter((v) => v.size).map((v) => v.size!)),
    ];
    const colors = [
      ...new Set(
        inStock
          .filter((v) => v.colorHex)
          .map((v) => JSON.stringify({ color: v.color, colorHex: v.colorHex }))
      ),
    ].map((v) => JSON.parse(v));

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

  const availableSizes = [
    ...new Set(
      product?.variants.filter((v) => Number(v.stock) > 0 && v.size).map((v) => v.size) || []
    ),
  ];

  const availableColors = [
    ...new Set(
      product?.variants
        .filter((v) => Number(v.stock) > 0 && v.colorHex)
        .map((v) => JSON.stringify({ color: v.color, colorHex: v.colorHex })) || []
    ),
  ].map((v) => JSON.parse(v));

  const needsSize = availableSizes.length > 0;
  const needsColor = availableColors.length > 0;

  const selectedVariant = product?.variants.find((v) => {
    if (Number(v.stock) <= 0) return false;
    if (needsSize && v.size !== selectedSize) return false;
    if (needsColor && v.colorHex !== selectedColor?.colorHex) return false;
    return true;
  });

  const hasAnyStock = product?.variants.some((v) => Number(v.stock) > 0) ?? false;
  const isInStock = selectedVariant ? Number(selectedVariant.stock) > 0 : false;
  const canAddToCart =
    isInStock &&
    (!needsSize || selectedSize) &&
    (!needsColor || selectedColor);

  const addToCartLabel = (() => {
    if (!hasAnyStock) return "Esaurito";
    if (needsSize && !selectedSize) return "Seleziona taglia";
    if (needsColor && !selectedColor) return "Seleziona colore";
    return "Aggiungi al Carrello";
  })();
  const averageRating =
    product?.reviews.length
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
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
      <div className="container-wide py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-surface animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-surface w-1/4" />
            <div className="h-8 bg-surface w-3/4" />
            <div className="h-6 bg-surface w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-wide py-16 text-center">
        <h1 className="text-display text-xl">Prodotto non trovato</h1>
      </div>
    );
  }

  return (
    <div className="container-wide py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="relative aspect-[3/4] bg-white overflow-hidden mb-3">
            <MediaImage
              src={product.images[selectedImage]?.url}
              alt={product.images[selectedImage]?.alt || product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              iconClassName="w-12 h-12"
            />
            {product.comparePrice && (
              <span className="absolute top-4 left-4 bg-foreground text-white text-[10px] uppercase tracking-widest px-2 py-1">
                -{Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)}%
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-white overflow-hidden border border-transparent ${
                    selectedImage === index ? "ring-1 ring-foreground border-border" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <MediaImage
                    src={image.url}
                    alt={image.alt || product.name}
                    fill
                    sizes="100px"
                    iconClassName="w-5 h-5"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted mb-2">{product.category.name}</p>
          <h1 className="text-display text-2xl md:text-3xl font-semibold mb-4">{product.name}</h1>

          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(averageRating) ? "fill-foreground text-foreground" : "text-border"} />
                ))}
              </div>
              <span className="text-xs text-muted">({product.reviews.length})</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-8">
            <span className="text-2xl font-medium">€{Number(product.price).toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-sm text-muted line-through">€{Number(product.comparePrice).toFixed(2)}</span>
            )}
          </div>

          {availableColors.length > 0 && (
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-widest text-muted mb-3">Colore — {selectedColor?.color || "Seleziona"}</p>
              <div className="flex space-x-2">
                {availableColors.map((color: ColorOption, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor?.colorHex === color.colorHex ? "border-black scale-110" : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color.colorHex ?? undefined }}
                    title={color.color ?? undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {availableSizes.length > 0 && (
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-widest text-muted mb-3">Taglia — {selectedSize || "Seleziona"}</p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const variant = product.variants.find(
                    (v) => v.size === size && (!selectedColor || v.colorHex === selectedColor.colorHex)
                  );
                  const isAvailable = variant && Number(variant.stock) > 0;
                  return (
                    <button
                      key={size}
                      onClick={() => isAvailable && setSelectedSize(size!)}
                      disabled={!isAvailable}
                      className={`min-w-[3rem] px-4 py-2.5 text-xs uppercase tracking-wider border transition-all duration-300 ${
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

          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-widest text-muted mb-3">Quantità</p>
            <div className="inline-flex items-center border border-border">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-surface transition-colors">
                <Minus size={14} />
              </button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(Number(selectedVariant?.stock) || 10, quantity + 1))} className="p-3 hover:bg-surface transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-10">
            <Button onClick={handleAddToCart} disabled={!canAddToCart} fullWidth size="lg" shape="pill">
              <ShoppingBag className="mr-2" size={18} />
              {addToCartLabel}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-4"
              onClick={async () => {
                if (!session) { router.push("/login"); return; }
                if (inWishlist) {
                  await fetch(`/api/wishlist?productId=${product.id}`, { method: "DELETE" });
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
              <Heart size={18} className={inWishlist ? "fill-foreground" : ""} />
            </Button>
          </div>

          <div className="border-t border-border pt-8 space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted">
              <Truck size={16} strokeWidth={1.5} />
              <span>Spedizione gratuita sopra i 50€</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <Shield size={16} strokeWidth={1.5} />
              <span>Reso entro 30 giorni</span>
            </div>
          </div>

          <details className="mt-8 border-t border-border pt-8 group">
            <summary className="text-[11px] uppercase tracking-widest cursor-pointer list-none flex items-center justify-between">
              Descrizione
              <span className="text-muted group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-sm text-muted leading-relaxed mt-4 whitespace-pre-line">{product.description}</p>
          </details>

          <div className="mt-8 border-t border-border pt-8">
            <h3 className="text-[11px] uppercase tracking-widest text-muted mb-4">Recensioni</h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted mb-4">Nessuna recensione ancora.</p>
            ) : (
              <div className="space-y-4 mb-6">
                {reviews.map((r) => (
                  <div key={r.id} className="text-sm border-b border-border pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < r.rating ? "fill-foreground text-foreground" : "text-border"} />
                      ))}
                      <span className="text-xs text-muted">{r.user.name}</span>
                    </div>
                    {r.comment && <p className="text-muted">{r.comment}</p>}
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
                    body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
                  });
                  setReviewComment("");
                  fetchProduct();
                }}
                className="space-y-3"
              >
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewRating(n)}>
                      <Star size={16} className={n <= reviewRating ? "fill-foreground text-foreground" : "text-border"} />
                    </button>
                  ))}
                </div>
                <Input
                  label="Commento"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                <Button type="submit" variant="outline" size="sm">Invia recensione</Button>
              </form>
            ) : (
              <p className="text-xs text-muted">
                <button onClick={() => router.push("/login")} className="underline">Accedi</button> per lasciare una recensione
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
