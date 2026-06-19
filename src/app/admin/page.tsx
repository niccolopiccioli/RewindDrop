import Link from "next/link";
import { Package, ShoppingCart, AlertTriangle, FolderTree } from "lucide-react";
import { prisma } from "@/lib/prisma";
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

export default async function AdminDashboardPage() {
  const threshold = Number(process.env.LOW_STOCK_THRESHOLD ?? 5);

  const [
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    paidOrders,
    lowStockVariants,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.variant.findMany({
      where: { stock: { lt: threshold }, active: true },
      include: { product: { select: { name: true, slug: true } } },
      take: 5,
      orderBy: { stock: "asc" },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const kpis = [
    {
      label: "Prodotti attivi",
      value: `${activeProducts}/${totalProducts}`,
      icon: Package,
      href: "/admin/prodotti",
    },
    {
      label: "Ordini totali",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      href: "/admin/ordini",
    },
    {
      label: "In attesa",
      value: pendingOrders.toString(),
      icon: AlertTriangle,
      href: "/admin/ordini?status=PENDING",
    },
    {
      label: "Ordini pagati",
      value: paidOrders.toString(),
      icon: FolderTree,
      href: "/admin/ordini?status=PAID",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Panoramica del tuo negozio"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="flex items-center gap-4 p-6 border border-border bg-white hover:border-foreground transition-colors duration-300"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <kpi.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{kpi.label}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Ordini recenti</h2>
          <DataTable>
            <table className="w-full">
              <DataTableHead>
                <DataTableHeaderCell>Ordine</DataTableHeaderCell>
                <DataTableHeaderCell>Cliente</DataTableHeaderCell>
                <DataTableHeaderCell>Stato</DataTableHeaderCell>
                <DataTableHeaderCell>Totale</DataTableHeaderCell>
              </DataTableHead>
              <DataTableBody>
                {recentOrders.map((order) => (
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
                      <StatusBadge
                        label={orderStatusLabels[order.status] || order.status}
                        variant={orderStatusVariant(order.status)}
                      />
                    </DataTableCell>
                    <DataTableCell>
                      €{Number(order.total).toFixed(2)}
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </table>
          </DataTable>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Stock basso</h2>
          {lowStockVariants.length === 0 ? (
            <p className="text-gray-600 text-sm">Nessun prodotto con stock critico.</p>
          ) : (
            <DataTable>
              <table className="w-full">
                <DataTableHead>
                  <DataTableHeaderCell>Prodotto</DataTableHeaderCell>
                  <DataTableHeaderCell>Variante</DataTableHeaderCell>
                  <DataTableHeaderCell>Stock</DataTableHeaderCell>
                </DataTableHead>
                <DataTableBody>
                  {lowStockVariants.map((variant) => (
                    <DataTableRow key={variant.id}>
                      <DataTableCell>
                        <Link
                          href={`/admin/prodotti/${variant.productId}`}
                          className="hover:underline"
                        >
                          {variant.product.name}
                        </Link>
                      </DataTableCell>
                      <DataTableCell>{variant.name}</DataTableCell>
                      <DataTableCell>
                        <StatusBadge
                          label={variant.stock.toString()}
                          variant={variant.stock === 0 ? "danger" : "warning"}
                        />
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </table>
            </DataTable>
          )}
        </div>
      </div>
    </div>
  );
}
