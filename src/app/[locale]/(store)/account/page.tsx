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

export default function AccountPage() {
  const paths = usePaths();
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/account/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data.slice(0, 3) : []));
  }, []);

  const quickLinks = [
    { href: paths.accountOrders, label: t("account.myOrders") },
    { href: paths.accountAddresses, label: t("account.savedAddresses") },
    { href: paths.accountWishlist, label: t("account.wishlist") },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border border-border p-6 hover:bg-surface transition-colors"
          >
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] uppercase tracking-widest text-muted">
            {t("account.recentOrders")}
          </h2>
          <Link href={paths.accountOrders} className="text-xs text-muted hover:text-foreground">
            {t("common.viewAll")}
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-muted">{t("account.noOrders")}</p>
        ) : (
          <div className="divide-y divide-border border border-border">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={paths.accountOrder(o.id)}
                className="flex justify-between items-center p-4 hover:bg-surface transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{o.number}</p>
                  <p className="text-xs text-muted">{o.status}</p>
                </div>
                <span className="text-sm">€{Number(o.total).toFixed(2)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
