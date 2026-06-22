export const US_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export type UsSize = (typeof US_SIZES)[number];

export interface VariantDraft {
  name: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  price: string;
  stock: string;
  active: boolean;
}

const CATEGORY_PREFIX: Record<string, string> = {
  "t-shirts": "TS",
  felpe: "FEL",
  pantaloni: "PAN",
  cappelli: "CAP",
  borse: "BOR",
  giacche: "GIA",
  sneakers: "SNK",
};

export function colorCode(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z]/g, "").toUpperCase();
  return (cleaned.slice(0, 3) || "DEF").padEnd(3, "X");
}

function productNameCode(productName: string): string {
  const words = productName
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .split(/[\s-]+/)
    .filter(Boolean);

  if (words.length === 0) return "PRD";

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function categorySkuPrefix(categorySlug: string): string {
  return CATEGORY_PREFIX[categorySlug] ?? categorySlug.slice(0, 3).toUpperCase();
}

export function generateProductSku({
  categorySlug,
  productName,
  sequence,
}: {
  categorySlug: string;
  productName: string;
  sequence?: number;
}): string {
  const prefix = categorySkuPrefix(categorySlug);
  const namePart = productNameCode(productName);
  const num =
    sequence ??
    Math.floor(Math.random() * 900) + 100;

  return `${prefix}-${namePart}-${String(num).padStart(3, "0")}`;
}

export function generateVariantSku({
  baseSku,
  size,
  color,
}: {
  baseSku: string;
  size: string;
  color?: string | null;
}): string {
  const normalizedSize = size.toUpperCase();

  if (!color) {
    return `${baseSku}-${normalizedSize}`;
  }

  return `${baseSku}-${colorCode(color)}-${normalizedSize}`;
}

export function sizeSortKey(size: string): number {
  const normalized = (size || "").trim().toUpperCase();
  if (!normalized || normalized === "UNI") return -1;

  const usIndex = US_SIZES.indexOf(normalized as UsSize);
  if (usIndex >= 0) return usIndex;

  if (/^\d+(\.\d+)?$/.test(normalized)) {
    return 100 + parseFloat(normalized);
  }

  return 1000 + normalized.charCodeAt(0);
}

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => sizeSortKey(a) - sizeSortKey(b));
}

export function uniqueSortedSizes(
  sizes: Iterable<string | null | undefined>
): string[] {
  return sortSizes([
    ...new Set(
      [...sizes].filter((size): size is string => Boolean(size && size.trim()))
    ),
  ]);
}

export function sortVariants(variants: VariantDraft[]): VariantDraft[] {
  return [...variants].sort((a, b) => {
    const colorCmp = (a.color || "").localeCompare(b.color || "", "it");
    if (colorCmp !== 0) return colorCmp;

    const sizeA = a.size || a.name || "";
    const sizeB = b.size || b.name || "";
    return sizeSortKey(sizeA) - sizeSortKey(sizeB);
  });
}

export function generateVariantMatrix({
  baseSku,
  sizes,
  colors,
  defaultStock = 10,
}: {
  baseSku: string;
  sizes: string[];
  colors: { name: string; hex?: string }[];
  defaultStock?: number;
}): VariantDraft[] {
  const stockStr = String(defaultStock);
  const orderedSizes = sortSizes(sizes);

  if (colors.length === 0) {
    return sortVariants(
      orderedSizes.map((size) => ({
        name: size === "UNI" ? "UNI" : size,
        sku: generateVariantSku({ baseSku, size }),
        size: size === "UNI" ? "" : size,
        color: "",
        colorHex: "",
        price: "",
        stock: stockStr,
        active: true,
      }))
    );
  }

  return sortVariants(
    colors.flatMap((color) =>
      orderedSizes.map((size) => ({
        name: size === "UNI" ? "UNI" : size,
        sku: generateVariantSku({ baseSku, size, color: color.name }),
        size: size === "UNI" ? "" : size,
        color: color.name,
        colorHex: color.hex ?? "",
        price: "",
        stock: stockStr,
        active: true,
      }))
    )
  );
}

export function recalculateVariantSkus(
  variants: VariantDraft[],
  baseSku: string
): VariantDraft[] {
  return sortVariants(
    variants.map((variant) => ({
      ...variant,
      sku: generateVariantSku({
        baseSku,
        size: variant.size || variant.name || "UNI",
        color: variant.color || null,
      }),
    }))
  );
}

export function generateUniqueSlug(baseSlug: string, attempt = 1): string {
  if (attempt === 1) return `${baseSlug}-copy`;
  return `${baseSlug}-copy-${attempt}`;
}
