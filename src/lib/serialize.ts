type DecimalLike = { toString(): string } | string | number | null | undefined;

export function toNumber(value: DecimalLike): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

export function serializeProduct<T extends Record<string, unknown>>(product: T) {
  return {
    ...product,
    price: toNumber(product.price as DecimalLike),
    comparePrice: toNumber(product.comparePrice as DecimalLike),
    weight: toNumber(product.weight as DecimalLike),
    variants: Array.isArray(product.variants)
      ? (product.variants as Record<string, unknown>[]).map((v) => ({
          ...v,
          price: toNumber(v.price as DecimalLike),
          weight: toNumber(v.weight as DecimalLike),
        }))
      : product.variants,
  };
}

export function serializeOrder<T extends Record<string, unknown>>(order: T) {
  return {
    ...order,
    subtotal: toNumber(order.subtotal as DecimalLike),
    shipping: toNumber(order.shipping as DecimalLike),
    tax: toNumber(order.tax as DecimalLike),
    total: toNumber(order.total as DecimalLike),
    items: Array.isArray(order.items)
      ? (order.items as Record<string, unknown>[]).map((item) => ({
          ...item,
          price: toNumber(item.price as DecimalLike),
          total: toNumber(item.total as DecimalLike),
        }))
      : order.items,
  };
}
