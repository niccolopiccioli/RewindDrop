import Link from "next/link";
import {
  Boxes,
  Euro,
  Mail,
  MessageSquare,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
} from "lucide-react";
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
import AnalyticsKpiCard from "@/components/admin/dashboard/analytics-kpi-card";
import RevenueChart from "@/components/admin/dashboard/revenue-chart";
import OrderStatusChart from "@/components/admin/dashboard/order-status-chart";
import CategoryPerformance from "@/components/admin/dashboard/category-performance";
import TopProductsTable from "@/components/admin/dashboard/top-products-table";
import {
  formatDateTime,
  formatEuro,
  type AdminAnalytics,
} from "@/lib/admin-analytics";

export default function DashboardAnalytics({ data }: { data: AdminAnalytics }) {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Analitiche e performance del negozio"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <AnalyticsKpiCard
          label="Fatturato mese"
          value={formatEuro(data.revenue.month)}
          hint={`Oggi ${formatEuro(data.revenue.today)}`}
          change={data.revenue.monthChange}
          href="/admin/ordini"
          icon={<Euro size={20} />}
        />
        <AnalyticsKpiCard
          label="Ordini mese"
          value={data.orders.month.toString()}
          hint={`${data.orders.total} ordini totali`}
          change={data.orders.monthChange}
          href="/admin/ordini"
          icon={<ShoppingBag size={20} />}
        />
        <AnalyticsKpiCard
          label="Valore medio ordine"
          value={formatEuro(data.orders.averageOrderValue)}
          hint="Su ordini pagati"
          icon={<Package size={20} />}
        />
        <AnalyticsKpiCard
          label="Clienti"
          value={data.customers.total.toString()}
          hint={`+${data.customers.month} questo mese`}
          change={data.customers.monthChange}
          icon={<Users size={20} />}
        />
      </div>

      <div className="mb-6">
        <RevenueChart data={data.dailyMetrics} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <OrderStatusChart data={data.ordersByStatus} />
        <CategoryPerformance data={data.categoryPerformance} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <AnalyticsKpiCard
          label="Catalogo attivo"
          value={`${data.catalog.activeProducts}/${data.catalog.totalProducts}`}
          hint={`${data.catalog.hiddenProducts} nascosti`}
          href="/admin/prodotti"
          icon={<Package size={20} />}
        />
        <AnalyticsKpiCard
          label="Inventario"
          value={data.catalog.totalUnits.toString()}
          hint={`${data.catalog.outOfStock} esauriti · ${data.catalog.lowStock} sotto soglia`}
          href="/admin/inventario"
          icon={<Warehouse size={20} />}
        />
        <AnalyticsKpiCard
          label="Varianti attive"
          value={data.catalog.totalVariants.toString()}
          hint="SKU gestiti"
          href="/admin/inventario"
          icon={<Boxes size={20} />}
        />
        <AnalyticsKpiCard
          label="Engagement"
          value={data.engagement.newsletterSubscribers.toString()}
          hint={`${data.engagement.pendingReviews} recensioni · ${data.engagement.wishlistItems} wishlist`}
          href="/admin/recensioni"
          icon={<Mail size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <TopProductsTable
            byRevenue={data.topProductsByRevenue}
            byQuantity={data.topProductsByQuantity}
          />
        </div>

        <section className="border border-border bg-white p-6">
          <h2 className="text-lg font-semibold">Snapshot negozio</h2>
          <p className="text-sm text-muted mt-1">Metriche rapide operative</p>
          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <dt className="text-sm text-muted">Fatturato totale</dt>
              <dd className="font-medium">{formatEuro(data.revenue.total)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <dt className="text-sm text-muted">Ordini oggi</dt>
              <dd className="font-medium">{data.orders.today}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <dt className="text-sm text-muted">Mese precedente</dt>
              <dd className="font-medium">{formatEuro(data.revenue.previousMonth)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <dt className="text-sm text-muted">Recensioni da approvare</dt>
              <dd className="font-medium flex items-center gap-2">
                <MessageSquare size={15} />
                {data.engagement.pendingReviews}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-muted">Soglia stock basso</dt>
              <dd className="font-medium">{data.threshold} unità</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold">Ordini recenti</h2>
            <Link
              href="/admin/ordini"
              className="text-xs uppercase tracking-widest text-muted hover:text-foreground"
            >
              Vedi tutti
            </Link>
          </div>
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
                {data.recentOrders.map((order) => (
                  <DataTableRow key={order.id}>
                    <DataTableCell>
                      <Link
                        href={`/admin/ordini/${order.id}`}
                        className="font-medium hover:underline"
                      >
                        {order.number}
                      </Link>
                    </DataTableCell>
                    <DataTableCell className="truncate max-w-[140px]">
                      {order.customer}
                    </DataTableCell>
                    <DataTableCell className="whitespace-nowrap text-muted text-sm">
                      {formatDateTime(order.createdAt)}
                    </DataTableCell>
                    <DataTableCell>
                      <StatusBadge
                        label={orderStatusLabels[order.status] || order.status}
                        variant={orderStatusVariant(order.status)}
                      />
                    </DataTableCell>
                    <DataTableCell>{formatEuro(order.total)}</DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </table>
          </DataTable>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold">Stock critico</h2>
            <Link
              href="/admin/inventario"
              className="text-xs uppercase tracking-widest text-muted hover:text-foreground"
            >
              Inventario
            </Link>
          </div>
          {data.lowStockVariants.length === 0 ? (
            <div className="border border-border bg-white p-6 text-sm text-muted">
              Nessun prodotto con stock critico.
            </div>
          ) : (
            <DataTable>
              <table className="w-full">
                <DataTableHead>
                  <DataTableHeaderCell>Prodotto</DataTableHeaderCell>
                  <DataTableHeaderCell>Variante</DataTableHeaderCell>
                  <DataTableHeaderCell>Stock</DataTableHeaderCell>
                </DataTableHead>
                <DataTableBody>
                  {data.lowStockVariants.map((variant) => (
                    <DataTableRow key={variant.id}>
                      <DataTableCell>
                        <Link
                          href={`/admin/prodotti/${variant.productId}`}
                          className="hover:underline font-medium"
                        >
                          {variant.productName}
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
        </section>
      </div>
    </div>
  );
}
