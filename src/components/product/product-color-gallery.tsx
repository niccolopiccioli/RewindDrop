"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MediaImage from "@/components/ui/media-image";
import { normalizeImageFit } from "@/lib/image-fit";
import type { ColorOption } from "@/lib/colors";
import {
  findImageIndexForColor,
  imageColorHex,
} from "@/lib/product-color-images";

type GalleryImage = {
  id: string;
  url: string;
  alt?: string | null;
  objectFit?: string | null;
  colorHex?: string | null;
};

interface ProductColorGalleryProps {
  images: GalleryImage[];
  productName: string;
  price: number;
  comparePrice?: number | null;
  selectedColor: ColorOption | null;
}

const slideEase = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 4500;
const AUTOPLAY_PAUSE_AFTER_INTERACTION_MS = 8000;

export default function ProductColorGallery({
  images,
  productName,
  price,
  comparePrice,
  selectedColor,
}: ProductColorGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hovered, setHovered] = useState(false);
  const pauseUntilRef = useRef(0);

  const hasMultiple = images.length > 1;

  const pauseAutoplay = useCallback((duration = AUTOPLAY_PAUSE_AFTER_INTERACTION_MS) => {
    pauseUntilRef.current = Date.now() + duration;
  }, []);

  const goTo = useCallback(
    (index: number, slideDirection = 0, fromUser = false) => {
      if (images.length === 0) return;
      const normalized =
        ((index % images.length) + images.length) % images.length;
      setDirection(slideDirection);
      setSelectedImage(normalized);
      if (fromUser) pauseAutoplay();
    },
    [images.length, pauseAutoplay]
  );

  const goNext = useCallback(
    (fromUser = false) => {
      setSelectedImage((current) => {
        const next = (current + 1) % images.length;
        setDirection(1);
        return next;
      });
      if (fromUser) pauseAutoplay();
    },
    [images.length, pauseAutoplay]
  );

  const goPrev = useCallback(
    (fromUser = false) => {
      setSelectedImage((current) => {
        const next = (current - 1 + images.length) % images.length;
        setDirection(-1);
        return next;
      });
      if (fromUser) pauseAutoplay();
    },
    [images.length, pauseAutoplay]
  );

  useEffect(() => {
    setSelectedImage((current) =>
      images.length === 0 ? 0 : Math.min(current, images.length - 1)
    );
  }, [images.length]);

  useEffect(() => {
    if (!selectedColor) return;
    const linkedIndex = findImageIndexForColor(images, selectedColor.colorHex);
    if (linkedIndex === null) return;

    setSelectedImage((current) => {
      if (current === linkedIndex) return current;
      setDirection(linkedIndex > current ? 1 : -1);
      return linkedIndex;
    });
  }, [selectedColor, images]);

  useEffect(() => {
    if (!hasMultiple || hovered) return;

    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (Date.now() < pauseUntilRef.current) return;
      goNext();
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [hasMultiple, hovered, goNext]);

  useEffect(() => {
    if (!hasMultiple) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goNext(true);
      if (event.key === "ArrowLeft") goPrev(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiple, goNext, goPrev]);

  const activeImage = images[selectedImage];
  const activeColorHex = imageColorHex(activeImage?.colorHex);
  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : null;

  return (
    <div className="lg:sticky lg:top-20 lg:self-start">
      <div
        className="group relative aspect-[3/4] bg-white overflow-hidden mb-3 border transition-shadow duration-500"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={() => pauseAutoplay()}
        style={{
          borderColor: activeColorHex ?? "transparent",
          boxShadow: activeColorHex
            ? `0 0 0 1px ${activeColorHex}, 0 24px 48px -28px ${activeColorHex}99`
            : undefined,
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeImage?.id ?? selectedImage}
            custom={direction}
            initial={{ x: direction >= 0 ? "100%" : "-100%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction >= 0 ? "-100%" : "100%", opacity: 0.6 }}
            transition={{ duration: 0.38, ease: slideEase }}
            drag={hasMultiple ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              pauseAutoplay();
              if (info.offset.x < -60 || info.velocity.x < -500) goNext(true);
              else if (info.offset.x > 60 || info.velocity.x > 500) goPrev(true);
            }}
            className="absolute inset-0 touch-pan-y"
          >
            <MediaImage
              src={activeImage?.url}
              alt={activeImage?.alt || productName}
              fill
              fit={normalizeImageFit(activeImage?.objectFit)}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={selectedImage === 0}
              iconClassName="w-12 h-12"
            />
          </motion.div>
        </AnimatePresence>

        {discount !== null && (
          <span className="absolute top-4 left-4 z-10 bg-foreground text-white text-[10px] uppercase tracking-widest px-2 py-1">
            -{discount}%
          </span>
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goPrev(true)}
              aria-label="Immagine precedente"
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/90 text-foreground opacity-100 md:opacity-0 shadow-sm transition-opacity md:group-hover:opacity-100 hover:bg-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goNext(true)}
              aria-label="Immagine successiva"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/90 text-foreground opacity-100 md:opacity-0 shadow-sm transition-opacity md:group-hover:opacity-100 hover:bg-white"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 flex items-center gap-0.5">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  aria-label={`Vai all'immagine ${index + 1}`}
                  onClick={() => goTo(index, index > selectedImage ? 1 : -1, true)}
                  className="touch-target flex items-center justify-center"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all ${
                      selectedImage === index
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/50"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="absolute top-4 right-4 z-10 bg-black/50 px-2 py-1 text-[10px] uppercase tracking-widest text-white">
              {selectedImage + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((image, index) => {
            const dotColor = imageColorHex(image.colorHex);
            const isSelected = selectedImage === index;
            const matchesColor =
              selectedColor && dotColor === selectedColor.colorHex;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => goTo(index, index > selectedImage ? 1 : -1, true)}
                className={`relative aspect-square w-20 shrink-0 bg-white overflow-hidden border transition-all duration-300 ${
                  isSelected
                    ? "ring-1 ring-foreground border-border opacity-100"
                    : matchesColor
                    ? "border-foreground/40 opacity-90 hover:opacity-100"
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                <MediaImage
                  src={image.url}
                  alt={image.alt || productName}
                  fill
                  fit={normalizeImageFit(image.objectFit)}
                  sizes="80px"
                  iconClassName="w-5 h-5"
                />
                {dotColor && (
                  <span
                    className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white shadow"
                    style={{ backgroundColor: dotColor }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
