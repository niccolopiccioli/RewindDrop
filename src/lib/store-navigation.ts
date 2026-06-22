import type { MessageKey } from "@/lib/i18n";
import { getPaths } from "@/lib/paths";
import type { Locale } from "@/lib/i18n/types";

export type StoreNavItem = {
  id: string;
  nameKey: MessageKey;
  href: string;
  accent?: boolean;
  pageKey: "newest" | "men" | "women" | "accessories" | "sale";
};

export function getStoreNavigation(locale: Locale): StoreNavItem[] {
  const paths = getPaths(locale);

  return [
    {
      id: "newest",
      nameKey: "nav.newArrivals",
      href: paths.productsNewest,
      pageKey: "newest",
    },
    {
      id: "men",
      nameKey: "nav.men",
      href: paths.productsMen,
      pageKey: "men",
    },
    {
      id: "women",
      nameKey: "nav.women",
      href: paths.productsWomen,
      pageKey: "women",
    },
    {
      id: "accessories",
      nameKey: "nav.accessories",
      href: paths.productsAccessories,
      pageKey: "accessories",
    },
    {
      id: "sale",
      nameKey: "nav.sale",
      href: paths.productsSale,
      accent: true,
      pageKey: "sale",
    },
  ];
}

export function isStoreNavActive(
  item: StoreNavItem,
  params: URLSearchParams
): boolean {
  const sort = params.get("sort");
  const gender = params.get("gender");
  const category = params.get("category");
  const sale = params.get("sale");
  const q = params.get("q");

  if (q) return false;

  switch (item.id) {
    case "newest":
      return sort === "newest" && !gender && !category && !sale;
    case "men":
      return gender === "men" && !sale;
    case "women":
      return gender === "women" && !sale;
    case "accessories":
      return category === "cappelli" && !gender && !sale;
    case "sale":
      return sale === "true";
    default:
      return false;
  }
}

export type ProductsPageKey =
  | "all"
  | "newest"
  | "men"
  | "women"
  | "accessories"
  | "sale"
  | "search"
  | "category";

export function resolveProductsPageKey(
  params: URLSearchParams
): ProductsPageKey {
  if (params.get("q")) return "search";

  const navMatch = getStoreNavigation("en").find((item) =>
    isStoreNavActive(item, params)
  );
  if (navMatch) return navMatch.pageKey;

  if (params.get("category")) return "category";

  return "all";
}
