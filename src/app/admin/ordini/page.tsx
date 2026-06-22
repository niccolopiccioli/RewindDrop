"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import DataTable, {
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from "@/components/admin/data-table";
import StatusBadge, {
  orderStatusVariant,
} from "@/components/admin/status-badge";
import { useAdminT } from "@/components/admin/admin-locale-provider";

interface Order {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
  user: { name: string | null; email: string };
}

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

function OrdersContent() {
  const searchParams = useSearchParams();
  const t = useAdminT();
  const ot = (k: string) => t(`admin.orders.${k}`);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    setLoading(true);
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      });
  }, [statusFilter]);

  const statusFilters = [
    { value: "", label: ot("all") },
    { value: "PENDING", label: ot("pending") },
    { value: "PAID", label: ot("paid") },
    { value: "PROCESSING", label: ot("processing") },
    { value: "SHIPPED", label: ot("shipped") },
    { value: "DELIVERED", label: ot("delivered") },
    { value: "CANCELLED", label: ot("cancelled") },
    { value: "REFUNDED", label: ot("refunded") },
  ];

  return (
    <div>
      <PageHeader title={ot("title")} description={ot("description")} />

      <div className="mb-6 flex gap-2 flex-wrap overflow-x-auto pb-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors whitespace-nowrap ${
              statusFilter === f.value
                ? "bg-black text-white border-black"
                : "border-gray-300 hover:border-black"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">{t("admin.common.loading")}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">{ot("noOrders")}</p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="block sm:hidden space-y-3 mb-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-border rounded-lg p-4">
                <div className="flex items-center justify-between gap-3 min-w-0">
                  <Link
                    href={`/admin/ordini/${order.id}`}
                    className="font-medium text-sm hover:text-muted transition-colors truncate"
                  >
                    {order.number}
                  </Link>
                  <StatusBadge
                    label={getStatusLabel(t, order.status)}
                    variant={orderStatusVariant(order.status)}
                  />
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                  <span className="truncate">{order.user.name || order.user.email}</span>
                  <span className="shrink-0">·</span>
                  <span className="shrink-0">{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="flex-1" />
                  <span className="shrink-0 font-medium text-foreground">
                    €{order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto">
              <DataTable>
                <table className="w-full min-w-[500px]">
                  <DataTableHead>
                    <DataTableHeaderCell>{ot("order")}</DataTableHeaderCell>
                    <DataTableHeaderCell>{ot("customer")}</DataTableHeaderCell>
                    <DataTableHeaderCell>{ot("date")}</DataTableHeaderCell>
                    <DataTableHeaderCell>{ot("status")}</DataTableHeaderCell>
                    <DataTableHeaderCell>{ot("total")}</DataTableHeaderCell>
                  </DataTableHead>
                  <DataTableBody>
                    {orders.map((order) => (
                      <DataTableRow key={order.id}>
                        <DataTableCell>
                          <Link
                            href={`/admin/ordini/${order.id}`}
                            className="font-medium hover:underline"
                          >
                            {order.number}
                          </Link>
                        </DataTableCell>
                        <DataTableCell>
                          {order.user.name || order.user.email}
                        </DataTableCell>
                        <DataTableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </DataTableCell>
                        <DataTableCell>
                          <StatusBadge
                            label={getStatusLabel(t, order.status)}
                            variant={orderStatusVariant(order.status)}
                          />
                        </DataTableCell>
                        <DataTableCell>€{order.total.toFixed(2)}</DataTableCell>
                      </DataTableRow>
                    ))}
                  </DataTableBody>
                </table>
              </DataTable>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">Caricamento...</p>}>
      <OrdersContent />
    </Suspense>
  );
}