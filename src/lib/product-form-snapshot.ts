import { sortVariants, type VariantDraft } from "@/lib/sku";
import type { ImageFit } from "@/lib/image-fit";
import { imageColorHex } from "@/lib/product-color-images";

export type ProductFormSnapshotInput = {
  name: string;
  slug: string;
  description: string;
  price: string;
  comparePrice: string;
  sku: string;
  barcode: string;
  weight: string;
  featured: boolean;
  active: boolean;
  tags: string;
  categoryId: string;
  images: {
    url: string;
    alt: string;
    position: number;
    objectFit: ImageFit;
    colorHex?: string | null;
  }[];
  variants: VariantDraft[];
};

export function createProductFormSnapshot(
  input: ProductFormSnapshotInput
): string {
  return JSON.stringify({
    name: input.name.trim(),
    slug: input.slug.trim(),
    description: input.description.trim(),
    price: input.price.trim(),
    comparePrice: input.comparePrice.trim(),
    sku: input.sku.trim(),
    barcode: input.barcode.trim(),
    weight: input.weight.trim(),
    featured: input.featured,
    active: input.active,
    tags: input.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    categoryId: input.categoryId,
    images: input.images
      .filter((image) => image.url.trim())
      .map((image, index) => ({
        url: image.url.trim(),
        alt: (image.alt || "").trim(),
        objectFit: image.objectFit,
        colorHex: imageColorHex(image.colorHex),
        position: index,
      })),
    variants: sortVariants(input.variants).map((variant) => ({
      name: variant.name.trim(),
      sku: variant.sku.trim(),
      size: (variant.size || "").trim(),
      color: (variant.color || "").trim(),
      colorHex: (variant.colorHex || "").trim(),
      price: (variant.price || "").trim(),
      stock: (variant.stock || "0").trim(),
      active: variant.active,
    })),
  });
}
