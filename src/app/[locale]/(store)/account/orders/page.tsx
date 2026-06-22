"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePaths } from "@/hooks/use-paths";
import { useI18n } from "@/components/layout/locale-provider";

type Order = {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
};

export default function OrdersPage() {
  const paths = usePaths();
  const { t, locale } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-sm text-muted">{t("products.loading")}</p>;

  if (orders.length === 0) {
    return (
      <div>
        <p className="text-sm text-muted mb-4">{t("account.noOrders")}</p>
        <Link href={paths.products} className="text-sm underline">
          {t("account.discoverProducts")}
        </Link>
      </div>
    );
  }

  const dateLocale =
    locale === "it" ? "it-IT" : locale === "es" ? "es-ES" : locale === "fr" ? "fr-FR" : "en-US";

  return (
    <div className="divide-y divide-border border border-border">
      {orders.map((o) => (
        <Link
          key={o.id}
          href={paths.accountOrder(o.id)}
          className="flex justify-between items-center p-4 hover:bg-surface transition-colors"
        >
          <div>
            <p className="text-sm font-medium">{o.number}</p>
            <p className="text-xs text-muted">
              {new Date(o.createdAt).toLocaleDateString(dateLocale)} — {o.status}
            </p>
          </div>
          <span className="text-sm">€{Number(o.total).toFixed(2)}</span>
        </Link>
      ))}
    </div>
  );
}

