"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Button from "@/components/ui/button";

type Order = {
  number: string;
  status: string;
  total: number;
  items: { name: string; quantity: number; total: number }[];
};

function OrderContent() {
  const { number } = useParams<{ number: string }>();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = email ? `?email=${encodeURIComponent(email)}` : "";
    fetch(`/api/orders/${number}${params}`)
      .then(async (r) => {
        if (!r.ok) {
          setError("Ordine non trovato");
          return;
        }
        setOrder(await r.json());
      });
  }, [number, email]);

  if (error) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-muted mb-4">{error}</p>
        <Link href="/"><Button variant="outline">Torna alla home</Button></Link>
      </div>
    );
  }

  if (!order) {
    return <div className="container-wide py-16 text-center text-muted text-sm">Caricamento...</div>;
  }

  return (
    <div className="container-wide mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-16 text-center">
      <CheckCircle size={48} strokeWidth={1} className="mx-auto text-foreground mb-6" />
      <h1 className="text-display text-xl font-semibold mb-2">Ordine confermato</h1>
      <p className="text-sm text-muted mb-1">Numero ordine</p>
      <p className="text-lg font-medium mb-6">{order.number}</p>
      <p className="text-sm text-muted mb-8">Stato: {order.status}</p>
      <div className="border border-border divide-y divide-border text-left mb-8">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between p-4 text-sm">
            <span>{item.name} ×{item.quantity}</span>
            <span>€{Number(item.total).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between p-4 text-sm font-medium">
          <span>Totale</span>
          <span>€{Number(order.total).toFixed(2)}</span>
        </div>
      </div>
      <Button onClick={() => window.location.href = "/"} shape="pill">Torna alla home</Button>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="container-wide py-16 text-center text-muted text-sm">Caricamento...</div>}>
      <OrderContent />
    </Suspense>
  );
}
