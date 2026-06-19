"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch(`/api/account/orders/${id}`)
      .then((r) => r.json())
      .then(setOrder);
  }, [id]);

  if (!order) return <p className="text-sm text-muted">Caricamento...</p>;

  const addr = order.shippingAddr;

  return (
    <div className="space-y-6">
      <Link href="/account/ordini" className="text-xs text-muted hover:text-foreground">
        ← Torna agli ordini
      </Link>
      <div>
        <h2 className="text-lg font-medium">{order.number}</h2>
        <p className="text-xs text-muted mt-1">
          {new Date(order.createdAt).toLocaleDateString("it-IT")} — {order.status}
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
        <div className="flex justify-between"><span className="text-muted">Subtotale</span><span>€{Number(order.subtotal).toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-muted">Spedizione</span><span>€{Number(order.shipping).toFixed(2)}</span></div>
        <div className="flex justify-between font-medium pt-2"><span>Totale</span><span>€{Number(order.total).toFixed(2)}</span></div>
      </div>
      {addr && (
        <div className="text-sm">
          <p className="text-[11px] uppercase tracking-widest text-muted mb-2">Spedizione</p>
          <p>{addr.name}</p>
          <p>{addr.street}</p>
          <p>{addr.postalCode} {addr.city}</p>
        </div>
      )}
    </div>
  );
}
