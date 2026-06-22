"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { ImageFit } from "@/lib/image-fit";
import { normalizeImageFit } from "@/lib/image-fit";
import {
  isExternalImageUrl,
  isLocalImagePath,
  normalizeImageUrl,
  optimizeImageUrl,
} from "@/lib/image-url";

export type { ImageFit };

type MediaImageProps = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  placeholderClassName?: string;
  iconClassName?: string;
  sizes?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  imageWidth?: number;
  width?: number;
  height?: number;
  /** cover = riempie il contenitore; contain = mostra tutta l'immagine */
  fit?: ImageFit;
};

function isLocalImage(src: string) {
  return isLocalImagePath(src);
}

function stripObjectFit(className: string) {
  return className
    .replace(/\bobject-(cover|contain|fill|none|scale-down)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveFit(
  fit: ImageFit | undefined,
  fill: boolean | undefined,
  className: string
): ImageFit {
  if (fit) return fit;
  if (className.includes("object-contain")) return "contain";
  if (className.includes("object-cover")) return "cover";
  return fill ? "cover" : "contain";
}

function fitClasses(fit: ImageFit, className: string) {
  const hasCustomPosition = /\bobject-(top|bottom|left|right|\[)/.test(className);
  const base = fit === "contain" ? "object-contain" : "object-cover";
  const position = hasCustomPosition ? "" : " object-center";
  return `${base}${position}`.trim();
}

function ImagePlaceholder({
  className = "",
  iconClassName = "w-8 h-8",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-surface ${className}`}
      aria-hidden
    >
      <X className={`text-border ${iconClassName}`} strokeWidth={1.5} />
    </div>
  );
}

export default function MediaImage({
  src,
  alt,
  fill,
  width,
  height,
  className = "",
  sizes,
  priority,
  loading,
  imageWidth,
  placeholderClassName = "",
  iconClassName = "w-8 h-8",
  fit,
}: MediaImageProps) {
  const [error, setError] = useState(false);
  const hasValidSrc = Boolean(src?.trim());

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!hasValidSrc || error) {
    if (fill) {
      return (
        <ImagePlaceholder
          className={`absolute inset-0 ${placeholderClassName}`}
          iconClassName={iconClassName}
        />
      );
    }
    return (
      <ImagePlaceholder
        className={placeholderClassName}
        iconClassName={iconClassName}
      />
    );
  }

  const imageSrc = optimizeImageUrl(
    normalizeImageUrl(src!.trim()),
    imageWidth ?? (priority ? 1200 : 800)
  );
  const external = isExternalImageUrl(imageSrc) || !isLocalImage(imageSrc);
  const resolvedLoading = loading ?? (priority ? "eager" : "lazy");
  const resolvedFit = normalizeImageFit(
    resolveFit(fit, fill, className)
  );
  const layoutClass = stripObjectFit(className);
  const objectClass = fitClasses(resolvedFit, className);
  const combinedClass = `${objectClass} ${layoutClass}`.trim();
  const fillClass = fill ? "absolute inset-0 h-full w-full max-h-full max-w-full" : "";

  if (external) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external URLs bypass next/image host allowlist
      <img
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`${fillClass} ${combinedClass}`.trim()}
        loading={resolvedLoading}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={`${combinedClass}`.trim()}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
