"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import StatusBadge, {
  orderStatusVariant,
} from "@/components/admin/status-badge";
import { useAdminT } from "@/components/admin/admin-locale-provider";

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

function getStatusLabel(t: ReturnType<typeof useAdminT>, status: string): string {
  const map: Record<string, string> = {
    PENDING: t("admin.orders.pending"),
    PROCESSING: t("admin.orders.processing"),
    PAID: t("admin.orders.paid"),
    SHIPPED: t("admin.orders.shipped"),
    DELIVERED: t("admin.orders.delivered"),
    CANCELLED: t("admin.orders.cancelled"),
    REFUNDED: t("admin.orders.refunded"),
  };
  return map[status] || status;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useAdminT();
  const ot = (k: string, vars?: Record<string, string | number>) => t(`admin.orders.${k}`, vars);
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

  if (loading) return <p className="text-gray-500">{t("admin.common.loading")}</p>;
  if (!order) return <p className="text-red-600">{ot("orderNotFound")}</p>;

  const addr = order.shippingAddr;

  return (
    <div>
      <PageHeader
        title={ot("orderNumber", { number: order.number })}
        description={ot("orderDate", { date: new Date(order.createdAt).toLocaleString(), customer: order.user.name || order.user.email })}
        backHref="/admin/ordini"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-200 rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-4">{ot("items")}</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      SKU: {item.sku}
                      {item.variant.size && ` · ${item.variant.size}`}
                      {item.variant.color && ` · ${item.variant.color}`}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p>
                      {item.quantity} × €{item.price.toFixed(2)}
                    </p>
                    <p className="font-medium">€{item.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-4">{ot("shippingAddr")}</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-medium">{addr.name}</p>
              <p>{addr.street}</p>
              <p>
                {addr.postalCode} {addr.city}
                {addr.province && ` (${addr.province})`}
              </p>
              {addr.phone && <p>{ot("tel", { number: addr.phone })}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-4">{ot("summary")}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{ot("subtotal")}</span>
                <span>€{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{ot("shipping")}</span>
                <span>€{order.shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                <span>{ot("totalLabel")}</span>
                <span>€{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-4">{ot("orderStatus")}</h2>
            <div className="mb-4">
              <StatusBadge
                label={getStatusLabel(t, order.status)}
                variant={orderStatusVariant(order.status)}
              />
            </div>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {getStatusLabel(t, s)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}