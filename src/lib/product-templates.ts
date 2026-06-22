import { US_SIZES } from "@/lib/sku";

export interface CategoryTemplate {
  sizes: string[];
  accessory: boolean;
}

const TEMPLATES: Record<string, CategoryTemplate> = {
  "t-shirts": { sizes: ["XS", "S", "M", "L", "XL"], accessory: false },
  felpe: { sizes: ["XS", "S", "M", "L", "XL"], accessory: false },
  pantaloni: { sizes: ["XS", "S", "M", "L", "XL"], accessory: false },
  giacche: { sizes: ["XS", "S", "M", "L", "XL"], accessory: false },
  sneakers: { sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"], accessory: false },
  cappelli: { sizes: ["UNI"], accessory: true },
  borse: { sizes: ["UNI"], accessory: true },
};

const DEFAULT_TEMPLATE: CategoryTemplate = {
  sizes: ["S", "M", "L", "XL"],
  accessory: false,
};

export function getCategoryTemplate(categorySlug: string): CategoryTemplate {
  return TEMPLATES[categorySlug] ?? DEFAULT_TEMPLATE;
}

export function getDefaultSizesForCategory(categorySlug: string): string[] {
  return [...getCategoryTemplate(categorySlug).sizes];
}

export { US_SIZES };
