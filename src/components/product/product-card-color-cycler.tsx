"use client";

import { useEffect, useMemo, useState } from "react";
import MediaImage from "@/components/ui/media-image";
import ProductBadge from "@/components/ui/product-badge";
import SizePills from "@/components/ui/size-pills";
import { normalizeImageFit } from "@/lib/image-fit";
import {
  buildProductColorSlides,
  staggerMsForId,
} from "@/lib/product-color-slides";

const CYCLE_MS = 3200;

interface ProductCardColorCyclerProps {
  productId: string;
  productName: string;
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
  displayBadge: string | null;
  badgeVariant?: "new" | "sale";
  availableSizes: string[];
  showSizes?: boolean;
}

export default function ProductCardColorCycler({
  productId,
  productName,
  images,
  variants,
  displayBadge,
  badgeVariant,
  availableSizes,
  showSizes,
}: ProductCardColorCyclerProps) {
  const slides = useMemo(
    () => buildProductColorSlides(images, variants),
    [images, variants]
  );
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  const hasMultiple = slides.length > 1;
  const active = slides[index] ?? slides[0];

  useEffect(() => {
    setIndex((current) =>
      slides.length === 0 ? 0 : Math.min(current, slides.length - 1)
    );
  }, [slides.length]);

  useEffect(() => {
    if (!hasMultiple || hovered) return;

    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        if (document.hidden) return;
        setIndex((current) => (current + 1) % slides.length);
      }, CYCLE_MS);
    }, staggerMsForId(productId));

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [hasMultiple, hovered, slides.length, productId]);

  if (!active) return null;

  return (
    <div
      className="relative aspect-[3/4] bg-white overflow-hidden mb-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
    >
      {hasMultiple ? (
        slides.map((slide, slideIndex) => (
          <div
            key={`${slide.image.url}-${slideIndex}`}
            className={`absolute inset-0 transition-opacity duration-500 ease-out ${
              slideIndex === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={slideIndex !== index}
          >
            <MediaImage
              src={slide.image.url}
              alt={slide.image.alt || productName}
              fill
              fit={normalizeImageFit(slide.image.objectFit)}
              imageWidth={480}
              loading="lazy"
              className="md:group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 280px"
            />
          </div>
        ))
      ) : (
        <MediaImage
          src={active.image.url}
          alt={active.image.alt || productName}
          fill
          fit={normalizeImageFit(active.image.objectFit)}
          imageWidth={480}
          loading="lazy"
          className="md:group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 280px"
        />
      )}

      {displayBadge && (
        <div className="absolute top-3 left-3 z-10">
          <ProductBadge label={displayBadge} variant={badgeVariant} />
        </div>
      )}

      {availableSizes.length > 0 && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-10 p-3 bg-gradient-to-t from-black/40 to-transparent ${
            showSizes
              ? "opacity-100"
              : "opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
          }`}
        >
          <SizePills sizes={availableSizes.slice(0, 6)} />
        </div>
      )}
    </div>
  );
}
