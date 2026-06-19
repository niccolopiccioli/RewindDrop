"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
};

export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/account/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data.slice(0, 3) : []));
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/account/ordini", label: "I miei ordini" },
          { href: "/account/indirizzi", label: "Indirizzi salvati" },
          { href: "/account/wishlist", label: "Wishlist" },
        ].map((item) => (
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
            Ordini recenti
          </h2>
          <Link href="/account/ordini" className="text-xs text-muted hover:text-foreground">
            Vedi tutti
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-muted">Nessun ordine ancora.</p>
        ) : (
          <div className="divide-y divide-border border border-border">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/account/ordini/${o.id}`}
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
