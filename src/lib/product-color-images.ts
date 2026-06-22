import { normalizeHex } from "@/lib/colors";

export type ColorLinkedImage = {
  url: string;
  alt?: string | null;
  objectFit?: string | null;
  colorHex?: string | null;
};

export function imageColorHex(hex?: string | null): string | null {
  return normalizeHex(hex || "");
}

export function findImageIndexForColor(
  images: ColorLinkedImage[],
  colorHex?: string | null
): number | null {
  const normalized = imageColorHex(colorHex);
  if (!normalized) return null;

  const index = images.findIndex(
    (image) => imageColorHex(image.colorHex) === normalized
  );
  return index >= 0 ? index : null;
}

export function linkImageToColor<T extends { colorHex?: string | null }>(
  images: T[],
  imageIndex: number,
  colorHex: string | null
): T[] {
  const normalized = imageColorHex(colorHex);

  return images.map((image, index) => {
    if (normalized) {
      if (index === imageIndex) {
        return { ...image, colorHex: normalized };
      }
      if (imageColorHex(image.colorHex) === normalized) {
        return { ...image, colorHex: null };
      }
      return image;
    }

    if (index === imageIndex) {
      return { ...image, colorHex: null };
    }

    return image;
  });
}
