"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link2, Unlink } from "lucide-react";
import MediaImage from "@/components/ui/media-image";
import type { ImageFit } from "@/lib/image-fit";
import { type ColorOption, uniqueColors } from "@/lib/colors";
import {
  findImageIndexForColor,
  imageColorHex,
} from "@/lib/product-color-images";

interface ProductImagePreviewProps {
  images: {
    url: string;
    alt: string;
    objectFit: ImageFit;
    colorHex?: string | null;
  }[];
  variants: {
    color?: string;
    colorHex?: string;
    stock: string;
  }[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onLinkColor: (imageIndex: number, colorHex: string | null) => void;
  name: string;
}

export default function ProductImagePreview({
  images,
  variants,
  activeIndex,
  onSelect,
  onLinkColor,
  name,
}: ProductImagePreviewProps) {
  const activeImage = images[activeIndex] ?? images[0];
  const filledImages = images
    .map((image, index) => ({ ...image, index }))
    .filter((image) => image.url);

  const palette = useMemo(
    () =>
      uniqueColors(
        variants.map((variant) => ({
          color: variant.color,
          colorHex: variant.colorHex,
          stock: variant.stock,
        }))
      ),
    [variants]
  );

  const activeColorHex = imageColorHex(activeImage?.colorHex);
  const activeColorName = palette.find(
    (color) => color.colorHex === activeColorHex
  )?.color;

  function handleColorPress(color: ColorOption) {
    const linkedIndex = findImageIndexForColor(images, color.colorHex);

    if (linkedIndex !== null) {
      onSelect(linkedIndex);
      return;
    }

    if (activeImage?.url) {
      onLinkColor(activeIndex, color.colorHex);
    }
  }

  function handleUnlink() {
    onLinkColor(activeIndex, null);
  }

  return (
    <div className="lg:sticky lg:top-6 border border-border bg-surface p-5 w-full">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted">
            Anteprima immagine
          </p>
          {palette.length > 0 && (
            <p className="mt-1 text-xs text-muted">
              Tocca un colore per collegarlo allo scatto attivo
            </p>
          )}
        </div>
        {activeColorHex && (
          <button
            type="button"
            onClick={handleUnlink}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted hover:text-foreground transition-colors"
          >
            <Unlink size={13} />
            Scollega
          </button>
        )}
      </div>

      <div
        className="relative aspect-[3/4] w-full max-w-md ml-auto overflow-hidden bg-white border transition-shadow duration-500"
        style={{
          borderColor: activeColorHex ?? undefined,
          boxShadow: activeColorHex
            ? `0 0 0 1px ${activeColorHex}, 0 18px 40px -24px ${activeColorHex}88`
            : undefined,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeIndex}-${activeImage?.url}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <MediaImage
              src={activeImage?.url}
              alt={activeImage?.alt || name}
              fill
              fit={activeImage?.objectFit ?? "cover"}
              sizes="(max-width: 768px) 100vw, 480px"
            />
          </motion.div>
        </AnimatePresence>

        {activeColorHex && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur px-2.5 py-1.5 border border-border">
            <span
              className="w-3 h-3 rounded-full border border-black/10"
              style={{ backgroundColor: activeColorHex }}
            />
            <span className="text-[10px] uppercase tracking-widest">
              {activeColorName || "Collegato"}
            </span>
          </div>
        )}
      </div>

      {palette.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted flex items-center gap-2">
            <Link2 size={13} />
            Palette colore
          </p>
          <div className="grid grid-cols-2 gap-2">
            {palette.map((color) => {
              const linkedIndex = findImageIndexForColor(images, color.colorHex);
              const linkedImage =
                linkedIndex !== null ? images[linkedIndex] : null;
              const isActiveColor = activeColorHex === color.colorHex;
              const isLinkedHere = linkedIndex === activeIndex;

              return (
                <button
                  key={color.colorHex}
                  type="button"
                  onClick={() => handleColorPress(color)}
                  className={`group relative flex items-center gap-3 border p-2 text-left transition-all ${
                    isActiveColor
                      ? "border-foreground bg-white shadow-sm"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  <span
                    className="relative w-10 h-10 shrink-0 rounded-full border-2 transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: color.colorHex,
                      borderColor: isActiveColor ? "#000" : "transparent",
                    }}
                  >
                    {linkedImage?.url ? (
                      <span className="absolute inset-0 overflow-hidden rounded-full border-2 border-white">
                        <MediaImage
                          src={linkedImage.url}
                          alt={color.color || name}
                          fill
                          fit={linkedImage.objectFit ?? "cover"}
                          sizes="40px"
                        />
                      </span>
                    ) : (
                      <span className="absolute inset-0 rounded-full border border-dashed border-white/70" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium truncate">
                      {color.color || color.colorHex}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-muted">
                      {linkedImage?.url
                        ? isLinkedHere
                          ? "Questo scatto"
                          : "Già collegato"
                        : "Tocca per collegare"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filledImages.length > 1 && (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {filledImages.map((image) => {
            const dotColor = imageColorHex(image.colorHex);
            return (
              <button
                key={image.index}
                type="button"
                onClick={() => onSelect(image.index)}
                className={`relative w-14 h-[4.5rem] overflow-hidden border transition-all ${
                  activeIndex === image.index
                    ? "border-foreground ring-1 ring-foreground"
                    : "border-border hover:border-foreground"
                }`}
              >
                <MediaImage
                  src={image.url}
                  alt={image.alt || name}
                  fill
                  fit={image.objectFit}
                  sizes="56px"
                />
                {dotColor && (
                  <span
                    className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white shadow"
                    style={{ backgroundColor: dotColor }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {activeImage?.url && (
        <p className="mt-4 text-xs text-muted text-right truncate">
          {activeImage.alt || name}
        </p>
      )}
    </div>
  );
}
