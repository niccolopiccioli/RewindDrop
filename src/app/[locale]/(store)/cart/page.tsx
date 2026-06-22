"use client";

import Link from "next/link";
import MediaImage from "@/components/ui/media-image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import Button from "@/components/ui/button";
import { useI18n } from "@/components/layout/locale-provider";
import { usePaths } from "@/hooks/use-paths";

export default function CartPage() {
  const { t } = useI18n();
  const paths = usePaths();
  const { items, removeItem, updateQuantity, clearCart, unavailableVariantIds } =
    useCartStore();

  const hasUnavailable = items.some((item) =>
    unavailableVariantIds.includes(item.variantId)
  );

  const subtotal = items.reduce((sum, item) => {
    if (unavailableVariantIds.includes(item.variantId)) return sum;
    return sum + item.price * item.quantity;
  }, 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-6">
          <ShoppingBag size={32} strokeWidth={1} className="text-border" />
        </div>
        <h1 className="text-display text-2xl font-semibold mb-3">
          {t("cart.empty")}
        </h1>
        <p className="text-sm text-muted mb-8 max-w-xs">{t("cart.emptyHint")}</p>
        <Link href={paths.products}>
          <Button shape="pill" size="lg">
            {t("cart.continueShopping")}
            <ArrowRight className="ml-2" size={16} />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-28 lg:pb-12">
      <header className="bg-foreground text-white -mx-4 px-4 sm:mx-0">
        <div className="container-wide py-8 sm:py-10">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/50 mb-2">
            {t("nav.cart")}
          </p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-display text-2xl sm:text-3xl font-semibold">
              {t("cart.title")}
            </h1>
            <span className="text-sm text-white/60 tabular-nums">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
        </div>
      </header>

      <div className="container-wide py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          <div className="lg:col-span-2 space-y-4">
            {hasUnavailable && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {t("cart.unavailableHint")}
              </p>
            )}

            {items.map((item) => {
              const unavailable = unavailableVariantIds.includes(item.variantId);

              return (
                <article
                  key={item.id}
                  className={`flex gap-4 sm:gap-5 p-4 sm:p-5 bg-white border border-border rounded-none sm:rounded-sm ${
                    unavailable ? "opacity-70" : ""
                  }`}
                >
                  <Link
                    href={paths.product(item.slug)}
                    className="relative w-24 sm:w-28 aspect-[3/4] bg-surface overflow-hidden shrink-0"
                  >
                    <MediaImage
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="112px"
                      iconClassName="w-6 h-6"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        {unavailable ? (
                          <p className="text-xs uppercase tracking-wide line-clamp-2 text-muted">
                            {item.name}
                          </p>
                        ) : (
                          <Link
                            href={paths.product(item.slug)}
                            className="text-xs sm:text-sm uppercase tracking-wide hover:text-muted transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                        )}
                        <p className="text-[11px] text-muted mt-1.5 uppercase tracking-wider">
                          {item.size && `${t("cart.size")} ${item.size}`}
                          {item.size && item.color && " · "}
                          {item.color}
                        </p>
                      </div>
                      {!unavailable && (
                        <p className="text-sm font-medium tabular-nums shrink-0">
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4">
                      {unavailable ? (
                        <span className="text-[11px] text-red-600 uppercase tracking-wider font-medium">
                          {t("cart.unavailable")}
                        </span>
                      ) : (
                        <div className="inline-flex items-center border border-border rounded-full overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.variantId,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="touch-target flex items-center justify-center hover:bg-surface"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-xs tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.variantId,
                                Math.min(item.stock, item.quantity + 1)
                              )
                            }
                            className="touch-target flex items-center justify-center hover:bg-surface"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="touch-target flex items-center justify-center text-muted hover:text-foreground transition-colors"
                        title={t("cart.remove")}
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            <button
              onClick={clearCart}
              className="text-xs text-muted hover:text-foreground transition-colors uppercase tracking-widest"
            >
              {t("cart.clear")}
            </button>
          </div>

          <div className="hidden lg:block">
            <div className="bg-surface p-8 sticky top-24">
              <h2 className="text-[11px] uppercase tracking-widest text-muted mb-6 flex items-center gap-2">
                <Tag size={14} />
                {t("cart.summary")}
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">{t("cart.subtotal")}</span>
                  <span className="tabular-nums">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">{t("cart.shipping")}</span>
                  <span>
                    {shipping === 0
                      ? t("cart.free")
                      : `€${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[11px] text-muted">{t("cart.freeOver")}</p>
                )}
                <div className="border-t border-border pt-4 flex justify-between font-medium text-lg">
                  <span>{t("cart.total")}</span>
                  <span className="tabular-nums">€{total.toFixed(2)}</span>
                </div>
              </div>
              <Link href={paths.checkout} className="block mt-6">
                <Button fullWidth shape="pill" size="lg" disabled={hasUnavailable}>
                  {t("cart.checkout")}
                  <ArrowRight className="ml-2" size={16} />
                </Button>
              </Link>
              {hasUnavailable && (
                <p className="mt-3 text-center text-xs text-red-600">
                  {t("cart.unavailableHint")}
                </p>
              )}
              <Link
                href={paths.products}
                className="block mt-4 text-center text-xs text-muted hover:text-foreground transition-colors"
              >
                {t("cart.continueShopping")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-sticky-bar lg:hidden animate-slide-up">
        <div className="flex items-center justify-between gap-4 px-4 py-3 safe-x">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted">
              {t("cart.total")}
            </p>
            <p className="text-lg font-semibold tabular-nums">
              €{total.toFixed(2)}
            </p>
          </div>
          <Link href={paths.checkout} className="shrink-0">
            <Button shape="pill" size="lg" disabled={hasUnavailable}>
              {t("cart.checkout")}
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
