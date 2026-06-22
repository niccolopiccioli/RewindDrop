const UPPER_WORDS = new Set([
  "og",
  "sp",
  "gs",
  "ii",
  "iii",
  "iv",
  "v",
  "vi",
  "vii",
  "viii",
  "ix",
  "x",
  "xi",
  "xii",
  "dri",
  "fit",
]);

/** Manual overrides when the default slug → filename mapping 404s on StockX CDN. */
export const STOCKX_IMAGE_OVERRIDES: Record<string, string> = {
  "asics-gel-1130-black-pure-silver": "ASICS-Gel-1130-Black-Pure-Silver-Product.jpg",
  "asics-gel-kayano-14-white-graphite-grey":
    "ASICS-Gel-Kayano-14-White-Graphite-Grey-Product.jpg",
  "nike-air-force-1-low-white-07": "Nike-Air-Force-1-07-White-Product.jpg",
  "adidas-samba-og-preloved-red-leopard-womens":
    "adidas-Samba-OG-Preloved-Red-Leopard-Womens-Product.jpg",
};

export function slugToStockxFilename(slug: string): string {
  if (STOCKX_IMAGE_OVERRIDES[slug]) {
    return STOCKX_IMAGE_OVERRIDES[slug];
  }

  const words = slug.split("-").map((word) => {
    if (/^\d+$/.test(word)) return word;
    if (word === "asics") return "ASICS";
    if (word === "alo") return "Alo";
    if (word === "youngla") return "YoungLA";
    if (UPPER_WORDS.has(word)) return word.toUpperCase();
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return `${words.join("-")}-Product.jpg`;
}

export function stockxProductImage(
  slug: string,
  options?: { width?: number; format?: "jpg" | "webp" }
): string {
  const filename = slugToStockxFilename(slug);
  const width = options?.width ?? 700;
  const format = options?.format ?? "jpg";

  return `https://images.stockx.com/images/${filename}?fit=fill&bg=FFFFFF&w=${width}&h=500&fm=${format}&auto=compress&q=90`;
}

export function stockxGalleryImage(slug: string, frame = "08"): string {
  const filename = slugToStockxFilename(slug).replace("-Product.jpg", "");
  const padded = frame.padStart(2, "0");

  return `https://images.stockx.com/360/${filename}/Images/${filename}/Lv2/img${padded}.jpg?fm=jpg&auto=compress&w=700&q=90`;
}

export async function stockxImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}
