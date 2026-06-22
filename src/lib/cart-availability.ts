import { prisma } from "@/lib/prisma";

export type CartItemRef = {
  productId: string;
  variantId: string;
};

export async function clearProductCartItems(productIds: string | string[]) {
  const ids = Array.isArray(productIds) ? productIds : [productIds];
  if (ids.length === 0) return;

  await prisma.cartItem.deleteMany({
    where: { productId: { in: ids } },
  });
}

export async function getUnavailableVariantIds(items: CartItemRef[]) {
  if (items.length === 0) return [];

  const variantIds = [...new Set(items.map((item) => item.variantId))];
  const productIds = [...new Set(items.map((item) => item.productId))];

  const [variants, products] = await Promise.all([
    prisma.variant.findMany({
      where: {
        id: { in: variantIds },
        active: true,
        product: { active: true },
      },
      select: { id: true, productId: true },
    }),
    prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
      select: { id: true },
    }),
  ]);

  const availableVariantIds = new Set(variants.map((variant) => variant.id));
  const activeProductIds = new Set(products.map((product) => product.id));

  return [
    ...new Set(
      items
        .filter(
          (item) =>
            !activeProductIds.has(item.productId) ||
            !availableVariantIds.has(item.variantId)
        )
        .map((item) => item.variantId)
    ),
  ];
}
