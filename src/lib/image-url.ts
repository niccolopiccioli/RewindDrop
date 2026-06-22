/**
 * Normalizes image URLs pasted in admin (protocol, whitespace, //cdn...).
 */
export function normalizeImageUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function resolveBannerImage(
  image: string | null | undefined,
  fallback: string
): string {
  const normalized = normalizeImageUrl(image || "");
  return normalized || fallback;
}

export function isExternalImageUrl(src: string): boolean {
  const normalized = normalizeImageUrl(src);
  return (
    normalized.startsWith("//") ||
    /^https?:\/\//i.test(normalized)
  );
}

export function isLocalImagePath(src: string): boolean {
  const normalized = normalizeImageUrl(src);
  return normalized.startsWith("/") && !normalized.startsWith("//");
}

/** Downscale remote CDN URLs for faster loads on cards, banners, and hero. */
export function optimizeImageUrl(
  src: string,
  width = 800,
  options?: { fit?: "crop" | "max" }
): string {
  const url = normalizeImageUrl(src);
  if (!url) return url;

  try {
    if (url.includes("images.unsplash.com")) {
      const parsed = new URL(url);
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("q", width > 900 ? "80" : "75");
      parsed.searchParams.set("auto", "format");
      const fit = options?.fit ?? "crop";
      if (fit === "max") {
        parsed.searchParams.set("fit", "max");
        parsed.searchParams.delete("h");
        parsed.searchParams.delete("crop");
      } else {
        parsed.searchParams.set("fit", "crop");
      }
      return parsed.toString();
    }

    if (url.includes("images.stockx.com")) {
      const parsed = new URL(url);
      const height = Math.round(width * 1.25);
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("h", String(height));
      parsed.searchParams.set("fm", "webp");
      parsed.searchParams.set("q", "80");
      parsed.searchParams.set("auto", "compress");
      if (!parsed.searchParams.has("fit")) {
        parsed.searchParams.set("fit", "fill");
      }
      if (!parsed.searchParams.has("bg")) {
        parsed.searchParams.set("bg", "FFFFFF");
      }
      return parsed.toString();
    }
  } catch {
    return url;
  }

  return url;
}
