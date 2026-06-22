import { uniqueColors, type ColorOption } from "@/lib/colors";
import {
  findImageIndexForColor,
  type ColorLinkedImage,
} from "@/lib/product-color-images";

export type ProductColorSlide = {
  color: ColorOption | null;
  image: ColorLinkedImage;
};

export function buildProductColorSlides(
  images: ColorLinkedImage[],
  variants: { color?: string | null; colorHex?: string | null; stock?: number }[]
): ProductColorSlide[] {
  if (images.length === 0) return [];

  const colors = uniqueColors(variants);

  if (colors.length > 0) {
    return colors.map((color) => {
      const linkedIndex = findImageIndexForColor(images, color.colorHex);
      const image = linkedIndex !== null ? images[linkedIndex] : images[0];
      return { color, image };
    });
  }

  if (images.length > 1) {
    return images.map((image) => ({ color: null, image }));
  }

  return [{ color: null, image: images[0] }];
}

export function staggerMsForId(id: string, max = 2400): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i) * (i + 3)) % max;
  }
  return hash;
}
