import type { Locale } from "@/lib/i18n/types";

export function getPaths(locale: Locale) {
  const base = `/${locale}`;
  return {
    home: base,
    products: `${base}/products`,
    productsNewest: `${base}/products?sort=newest`,
    productsSale: `${base}/products?sale=true`,
    productsMen: `${base}/products?gender=men`,
    productsWomen: `${base}/products?gender=women`,
    productsAccessories: `${base}/products?category=cappelli`,
    product: (slug: string) => `${base}/products/${slug}`,
    productsCategory: (slug: string) => `${base}/products?category=${slug}`,
    productsSearch: (q: string) =>
      `${base}/products?q=${encodeURIComponent(q)}`,
    cart: `${base}/cart`,
    checkout: `${base}/checkout`,
    login: `${base}/login`,
    account: `${base}/account`,
    accountOrders: `${base}/account/orders`,
    accountOrder: (id: string) => `${base}/account/orders/${id}`,
    accountAddresses: `${base}/account/addresses`,
    accountProfile: `${base}/account/profile`,
    accountWishlist: `${base}/account/wishlist`,
    shipping: `${base}/shipping`,
    returns: `${base}/returns`,
    privacy: `${base}/privacy`,
    order: (number: string) => `${base}/order/${number}`,
    orderWithEmail: (number: string, email: string) =>
      `${base}/order/${number}?email=${encodeURIComponent(email)}`,
  } as const;
}

export type Paths = ReturnType<typeof getPaths>;
