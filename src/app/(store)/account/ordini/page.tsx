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

export default function OrdersPage() {
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

  if (loading) return <p className="text-sm text-muted">Caricamento...</p>;

  if (orders.length === 0) {
    return (
      <div>
        <p className="text-sm text-muted mb-4">Non hai ancora effettuato ordini.</p>
        <Link href="/prodotti" className="text-sm underline">Scopri i prodotti</Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border border border-border">
      {orders.map((o) => (
        <Link
          key={o.id}
          href={`/account/ordini/${o.id}`}
          className="flex justify-between items-center p-4 hover:bg-surface transition-colors"
        >
          <div>
            <p className="text-sm font-medium">{o.number}</p>
            <p className="text-xs text-muted">
              {new Date(o.createdAt).toLocaleDateString("it-IT")} — {o.status}
            </p>
          </div>
          <span className="text-sm">€{Number(o.total).toFixed(2)}</span>
        </Link>
      ))}
    </div>
  );
}
