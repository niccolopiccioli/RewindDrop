"use client";

import Link from "next/link";
import MediaImage from "@/components/ui/media-image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import Button from "@/components/ui/button";

export default function CarrelloPage() {
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
      <div className="container-wide py-20 md:py-32 text-center">
        <ShoppingBag size={48} strokeWidth={1} className="mx-auto text-border mb-6" />
        <h1 className="text-display text-xl md:text-2xl font-semibold mb-3">Carrello vuoto</h1>
        <p className="text-sm text-muted mb-8">Scopri la collezione e aggiungi qualcosa.</p>
        <Link href="/prodotti">
          <Button shape="pill" size="lg">
            Continua lo shopping
            <ArrowRight className="ml-2" size={16} />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-wide py-8 md:py-12">
      <h1 className="text-display text-2xl font-semibold mb-8 md:mb-10">Carrello</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
        <div className="lg:col-span-2 space-y-0 divide-y divide-border">
          {hasUnavailable && (
            <p className="text-sm text-red-600 pb-4">
              Alcuni articoli nel carrello non sono più disponibili. Rimuovili per
              procedere al checkout.
            </p>
          )}
          {items.map((item) => {
            const unavailable = unavailableVariantIds.includes(item.variantId);

            return (
            <div
              key={item.id}
              className={`flex gap-5 py-6 first:pt-0 ${unavailable ? "opacity-70" : ""}`}
            >
              <div className="relative w-24 h-32 md:w-28 md:h-36 bg-white border border-border overflow-hidden flex-shrink-0">
                <MediaImage src={item.image} alt={item.name} fill sizes="112px" iconClassName="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  {unavailable ? (
                    <p className="text-xs uppercase tracking-wide line-clamp-1 text-muted">
                      {item.name}
                    </p>
                  ) : (
                    <Link href={`/prodotti/${item.slug}`} className="text-xs uppercase tracking-wide hover:text-muted transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                  )}
                  {unavailable ? (
                    <p className="text-xs text-red-600 font-medium mt-2">
                      Prodotto non più disponibile
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted mt-1 uppercase tracking-wider">
                      {item.size && `Taglia ${item.size}`}
                      {item.size && item.color && " · "}
                      {item.color}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4">
                  {!unavailable ? (
                    <div className="inline-flex items-center border border-border">
                      <button onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))} className="p-2 hover:bg-surface">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.variantId, Math.min(item.stock, item.quantity + 1))} className="p-2 hover:bg-surface">
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted uppercase tracking-wider">
                      Non acquistabile
                    </span>
                  )}
                  <div className="flex items-center gap-4">
                    {!unavailable && (
                      <span className="text-sm font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                    )}
                    <button onClick={() => removeItem(item.variantId)} className="text-muted hover:text-foreground transition-colors" title="Rimuovi dal carrello">
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
          <button onClick={clearCart} className="text-xs text-muted hover:text-foreground pt-4 transition-colors">
            Svuota carrello
          </button>
        </div>

        <div>
          <div className="bg-surface p-6 md:p-8 sticky top-20">
            <h2 className="text-[11px] uppercase tracking-widest text-muted mb-6">Riepilogo</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotale</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Spedizione</span>
                <span>{shipping === 0 ? "Gratuita" : `€${shipping.toFixed(2)}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-[11px] text-muted">Gratuita sopra i 50€</p>
              )}
              <div className="border-t border-border pt-4 flex justify-between font-medium text-base">
                <span>Totale</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block mt-6">
              <Button fullWidth shape="pill" size="lg" disabled={hasUnavailable}>
                Procedi al checkout
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
            {hasUnavailable && (
              <p className="mt-3 text-center text-xs text-red-600">
                Rimuovi i prodotti non disponibili per continuare.
              </p>
            )}
            <Link href="/prodotti" className="block mt-4 text-center text-xs text-muted hover:text-foreground transition-colors">
              Continua lo shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
