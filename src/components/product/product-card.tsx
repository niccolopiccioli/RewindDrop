"use client";

import Link from "next/link";
import MediaImage from "@/components/ui/media-image";
import ProductBadge from "@/components/ui/product-badge";
import ProductCardColorCycler from "@/components/product/product-card-color-cycler";
import SizePills from "@/components/ui/size-pills";
import { normalizeImageFit } from "@/lib/image-fit";
import { usePaths } from "@/hooks/use-paths";
import { useI18n } from "@/components/layout/locale-provider";
import { uniqueSortedSizes } from "@/lib/sku";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    featured?: boolean;
    images: {
      url: string;
      alt?: string | null;
      objectFit?: string | null;
      colorHex?: string | null;
    }[];
    variants: {
      size?: string | null;
      color?: string | null;
      colorHex?: string | null;
      stock: number;
    }[];
  };
  badge?: "new" | "sale" | null;
  showSizes?: boolean;
  cycleColors?: boolean;
}

export default function ProductCard({
  product,
  badge,
  showSizes,
  cycleColors = false,
}: ProductCardProps) {
  const paths = usePaths();
  const { t } = useI18n();
  const price = Number(product.price);
  const comparePrice = product.comparePrice
    ? Number(product.comparePrice)
    : null;

  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : null;

  const availableSizes = uniqueSortedSizes(
    product.variants
      .filter((v) => Number(v.stock) > 0)
      .map((v) => v.size)
  );

  const displayBadge =
    badge === "sale" && discount
      ? `-${discount}%`
      : badge === "new"
      ? t("common.new")
      : product.featured
      ? t("product.featured")
      : null;

  const primaryImage = product.images[0];

  return (
    <article className="group">
      <Link href={paths.product(product.slug)} className="block">
        {cycleColors ? (
          <ProductCardColorCycler
            productId={product.id}
            productName={product.name}
            images={product.images}
            variants={product.variants}
            displayBadge={displayBadge}
            badgeVariant={badge === "new" ? "new" : "sale"}
            availableSizes={availableSizes}
            showSizes={showSizes}
          />
        ) : (
          <div className="relative aspect-[3/4] bg-white overflow-hidden mb-3">
            <MediaImage
              src={primaryImage?.url}
              alt={primaryImage?.alt || product.name}
              fill
              fit={normalizeImageFit(primaryImage?.objectFit)}
              imageWidth={480}
              loading="lazy"
              className="md:group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 280px"
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
              <div
                className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/40 to-transparent ${
                  showSizes
                    ? "opacity-100"
                    : "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
                }`}
              >
                <SizePills sizes={availableSizes.slice(0, 6)} />
              </div>
            )}
          </div>
        )}
      </Link>

      <div className="space-y-1">
        <Link href={paths.product(product.slug)}>
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
