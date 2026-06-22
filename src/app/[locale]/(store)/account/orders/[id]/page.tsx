"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePaths } from "@/hooks/use-paths";
import { useI18n } from "@/components/layout/locale-provider";

type Order = {
  id: string;
  number: string;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddr: Record<string, string>;
  items: { name: string; quantity: number; price: number; total: number }[];
  createdAt: string;
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const paths = usePaths();
  const { t, locale } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch(`/api/account/orders/${id}`)
      .then((r) => r.json())
      .then(setOrder);
  }, [id]);

  if (!order) return <p className="text-sm text-muted">{t("products.loading")}</p>;

  const addr = order.shippingAddr;
  const dateLocale =
    locale === "it" ? "it-IT" : locale === "es" ? "es-ES" : locale === "fr" ? "fr-FR" : "en-US";

  return (
    <div className="space-y-6">
      <Link href={paths.accountOrders} className="text-xs text-muted hover:text-foreground">
        ← {t("account.backToOrders")}
      </Link>
      <div>
        <h2 className="text-lg font-medium">{order.number}</h2>
        <p className="text-xs text-muted mt-1">
          {new Date(order.createdAt).toLocaleDateString(dateLocale)} — {order.status}
        </p>
      </div>
      <div className="border border-border divide-y divide-border">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between p-4 text-sm">
            <span>{item.name} ×{item.quantity}</span>
            <span>€{Number(item.total).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted">{t("cart.subtotal")}</span>
          <span>€{Number(order.subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">{t("cart.shipping")}</span>
          <span>€{Number(order.shipping).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-medium pt-2">
          <span>{t("cart.total")}</span>
          <span>€{Number(order.total).toFixed(2)}</span>
        </div>
      </div>
      {addr && (
        <div className="text-sm">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-2">
            {t("cart.shipping")}
          </p>
          <p>{addr.name}</p>
          <p>{addr.street}</p>
          <p>
            {addr.postalCode} {addr.city}
          </p>
        </div>
      )}
    </div>
  );
}
