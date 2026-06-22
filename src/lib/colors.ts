export function normalizeHex(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return /^#[0-9A-Fa-f]{6}$/.test(withHash) ? withHash.toUpperCase() : null;
}

export function hexForColorInput(value: string): string {
  return normalizeHex(value) ?? "#000000";
}

export type ColorOption = {
  color?: string | null;
  colorHex: string;
};

export function uniqueColors(
  variants: { color?: string | null; colorHex?: string | null; stock?: number | string }[],
  options?: { inStockOnly?: boolean }
): ColorOption[] {
  const inStockOnly = options?.inStockOnly ?? false;
  const seen = new Set<string>();
  const colors: ColorOption[] = [];

  for (const variant of variants) {
    const hex = normalizeHex(variant.colorHex || "");
    if (!hex) continue;
    if (inStockOnly && Number(variant.stock) <= 0) continue;
    if (seen.has(hex)) continue;
    seen.add(hex);
    colors.push({ color: variant.color || null, colorHex: hex });
  }

  return colors;
}
