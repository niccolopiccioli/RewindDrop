"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

type ImageFit = "cover" | "contain";

type MediaImageProps = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  placeholderClassName?: string;
  iconClassName?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  /** cover = crop to fill; contain = show full image (default for external URLs) */
  fit?: ImageFit;
};

function isLocalImage(src: string) {
  return src.startsWith("/") && !src.startsWith("//");
}

function isExternalImage(src: string) {
  return !isLocalImage(src);
}

function stripObjectFit(className: string) {
  return className
    .replace(/\bobject-(cover|contain|fill|none|scale-down)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveFit(
  fit: ImageFit | undefined,
  src: string,
  className: string
): ImageFit {
  if (fit) return fit;
  if (className.includes("object-contain")) return "contain";
  if (className.includes("object-cover")) return "cover";
  return isExternalImage(src) ? "contain" : "cover";
}

function fitClasses(fit: ImageFit, isExternal: boolean) {
  const base = fit === "contain" ? "object-contain object-center" : "object-cover object-center";
  const padding = fit === "contain" && isExternal ? "p-2" : "";
  return `${base} ${padding}`.trim();
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

  const imageSrc = src!.trim();
  const external = isExternalImage(imageSrc);
  const resolvedFit = resolveFit(fit, imageSrc, className);
  const layoutClass = stripObjectFit(className);
  const objectClass = fitClasses(resolvedFit, external);
  const combinedClass = `${objectClass} ${layoutClass}`.trim();

  if (external) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- external URLs bypass next/image host allowlist
        <img
          src={imageSrc}
          alt={alt}
          className={`absolute inset-0 h-full w-full max-h-full max-w-full ${combinedClass}`}
          onError={() => setError(true)}
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element -- external URLs bypass next/image host allowlist
      <img
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={combinedClass}
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
      className={combinedClass}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
