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
  orderStatusLabels,
  orderStatusVariant,
} from "@/components/admin/status-badge";

interface Order {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
  user: { name: string | null; email: string };
}

const statusFilters = [
  { value: "", label: "Tutti" },
  { value: "PENDING", label: "In attesa" },
  { value: "PAID", label: "Pagati" },
  { value: "PROCESSING", label: "In lavorazione" },
  { value: "SHIPPED", label: "Spediti" },
  { value: "DELIVERED", label: "Consegnati" },
  { value: "CANCELLED", label: "Annullati" },
  { value: "REFUNDED", label: "Rimborsati" },
];

function OrdersContent() {
  const searchParams = useSearchParams();
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

  return (
    <div>
      <PageHeader title="Ordini" description="Gestisci gli ordini dei clienti" />

      <div className="mb-6 flex gap-2 flex-wrap">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
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
        <p className="text-gray-500">Caricamento...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">Nessun ordine trovato.</p>
      ) : (
        <DataTable>
          <table className="w-full">
            <DataTableHead>
              <DataTableHeaderCell>Ordine</DataTableHeaderCell>
              <DataTableHeaderCell>Cliente</DataTableHeaderCell>
              <DataTableHeaderCell>Data</DataTableHeaderCell>
              <DataTableHeaderCell>Stato</DataTableHeaderCell>
              <DataTableHeaderCell>Totale</DataTableHeaderCell>
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
                    {new Date(order.createdAt).toLocaleDateString("it-IT")}
                  </DataTableCell>
                  <DataTableCell>
                    <StatusBadge
                      label={orderStatusLabels[order.status] || order.status}
                      variant={orderStatusVariant(order.status)}
                    />
                  </DataTableCell>
                  <DataTableCell>€{order.total.toFixed(2)}</DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </table>
        </DataTable>
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
