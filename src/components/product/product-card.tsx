"use client";

import Link from "next/link";
import MediaImage from "@/components/ui/media-image";
import ProductBadge from "@/components/ui/product-badge";
import SizePills from "@/components/ui/size-pills";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    featured?: boolean;
    images: { url: string; alt?: string | null }[];
    variants: {
      size?: string | null;
      color?: string | null;
      colorHex?: string | null;
      stock: number;
    }[];
  };
  badge?: "new" | "sale" | null;
}

export default function ProductCard({ product, badge }: ProductCardProps) {
  const price = Number(product.price);
  const comparePrice = product.comparePrice
    ? Number(product.comparePrice)
    : null;

  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : null;

  const availableSizes = [
    ...new Set(
      product.variants
        .filter((v) => Number(v.stock) > 0 && v.size)
        .map((v) => v.size!)
    ),
  ];

  const displayBadge =
    badge === "sale" && discount
      ? `-${discount}%`
      : badge === "new"
      ? "Nuovo"
      : product.featured
      ? "In evidenza"
      : null;

  const primaryImage = product.images[0];

  return (
    <article className="group">
      <Link href={`/prodotti/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-white overflow-hidden mb-3">
          <MediaImage
            src={primaryImage?.url}
            alt={primaryImage?.alt || product.name}
            fill
            className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {displayBadge && (
            <div className="absolute top-3 left-3">
              <ProductBadge
                label={displayBadge}
                variant={badge === "new" ? "new" : "sale"}
              />
            </div>
          )}
          {availableSizes.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/40 to-transparent">
              <SizePills sizes={availableSizes.slice(0, 6)} />
            </div>
          )}
        </div>
      </Link>

      <div className="space-y-1">
        <Link href={`/prodotti/${product.slug}`}>
          <h3 className="text-xs uppercase tracking-wide text-foreground line-clamp-1 group-hover:text-muted transition-colors duration-300">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">€{price.toFixed(2)}</span>
          {comparePrice && (
            <span className="text-xs text-muted line-through">
              €{comparePrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
