"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import StatusBadge, {
  orderStatusLabels,
  orderStatusVariant,
} from "@/components/admin/status-badge";

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  variant: { size: string | null; color: string | null };
}

interface Order {
  id: string;
  number: string;
  status: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddr: Record<string, string>;
  createdAt: string;
  user: { name: string | null; email: string };
  items: OrderItem[];
}

const statusOptions = [
  "PENDING",
  "PROCESSING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = () => {
    fetch(`/api/admin/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleStatusChange = async (status: string) => {
    setUpdating(true);
    const res = await fetch(`/api/admin/orders/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchOrder();
      router.refresh();
    }
    setUpdating(false);
  };

  if (loading) return <p className="text-gray-500">Caricamento...</p>;
  if (!order) return <p className="text-red-600">Ordine non trovato</p>;

  const addr = order.shippingAddr;

  return (
    <div>
      <Link
        href="/admin/ordini"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black mb-4"
      >
        <ArrowLeft size={16} />
        Torna agli ordini
      </Link>

      <PageHeader
        title={`Ordine ${order.number}`}
        description={`${new Date(order.createdAt).toLocaleString("it-IT")} — ${order.user.name || order.user.email}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Articoli</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      SKU: {item.sku}
                      {item.variant.size && ` · ${item.variant.size}`}
                      {item.variant.color && ` · ${item.variant.color}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>
                      {item.quantity} × €{item.price.toFixed(2)}
                    </p>
                    <p className="font-medium">€{item.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Indirizzo di spedizione</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">{addr.name}</p>
              <p>{addr.street}</p>
              <p>
                {addr.postalCode} {addr.city}
                {addr.province && ` (${addr.province})`}
              </p>
              {addr.phone && <p>Tel: {addr.phone}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Riepilogo</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotale</span>
                <span>€{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Spedizione</span>
                <span>€{order.shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                <span>Totale</span>
                <span>€{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Stato ordine</h2>
            <div className="mb-4">
              <StatusBadge
                label={orderStatusLabels[order.status] || order.status}
                variant={orderStatusVariant(order.status)}
              />
            </div>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {orderStatusLabels[s] || s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
