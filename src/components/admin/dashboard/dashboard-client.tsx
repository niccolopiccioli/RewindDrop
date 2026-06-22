"use client";

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
  orderStatusVariant,
} from "@/components/admin/status-badge";
import AnalyticsKpiCard from "@/components/admin/dashboard/analytics-kpi-card";
import RevenueChart from "@/components/admin/dashboard/revenue-chart";
import OrderStatusChart from "@/components/admin/dashboard/order-status-chart";
import CategoryPerformance from "@/components/admin/dashboard/category-performance";
import TopProductsTable from "@/components/admin/dashboard/top-products-table";
import { formatEuro, formatDateTime } from "@/lib/format";
import type { AdminAnalytics } from "@/lib/admin-analytics";
import { useAdminT } from "@/components/admin/admin-locale-provider";

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

export default function DashboardClient({ data }: { data: AdminAnalytics }) {
  const t = useAdminT();
  const dt = (k: string, vars?: Record<string, string | number>) => t(`admin.dashboard.${k}`, vars);

  return (
    <div>
      <PageHeader
        title={dt("title")}
        description={dt("description")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <AnalyticsKpiCard
          label={dt("revenueMonth")}
          value={formatEuro(data.revenue.month)}
          hint={dt("today", { amount: formatEuro(data.revenue.today) })}
          change={data.revenue.monthChange}
          href="/admin/ordini"
          icon={<Euro size={20} />}
        />
        <AnalyticsKpiCard
          label={dt("ordersMonth")}
          value={data.orders.month.toString()}
          hint={dt("totalOrders", { count: data.orders.total })}
          change={data.orders.monthChange}
          href="/admin/ordini"
          icon={<ShoppingBag size={20} />}
        />
        <AnalyticsKpiCard
          label={dt("avgOrderValue")}
          value={formatEuro(data.orders.averageOrderValue)}
          hint={dt("onPaidOrders")}
          icon={<Package size={20} />}
        />
        <AnalyticsKpiCard
          label={dt("customers")}
          value={data.customers.total.toString()}
          hint={dt("newThisMonth", { count: data.customers.month })}
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
          label={dt("activeCatalog")}
          value={`${data.catalog.activeProducts}/${data.catalog.totalProducts}`}
          hint={dt("hidden", { count: data.catalog.hiddenProducts })}
          href="/admin/products"
          icon={<Package size={20} />}
        />
        <AnalyticsKpiCard
          label={dt("inventory")}
          value={data.catalog.totalUnits.toString()}
          hint={dt("outOfStock", { outOfStock: data.catalog.outOfStock, lowStock: data.catalog.lowStock })}
          href="/admin/inventario"
          icon={<Warehouse size={20} />}
        />
        <AnalyticsKpiCard
          label={dt("activeVariants")}
          value={data.catalog.totalVariants.toString()}
          hint={dt("managedSkus")}
          href="/admin/inventario"
          icon={<Boxes size={20} />}
        />
        <AnalyticsKpiCard
          label={dt("engagement")}
          value={data.engagement.newsletterSubscribers.toString()}
          hint={dt("reviewsWishlist", { reviews: data.engagement.pendingReviews, wishlist: data.engagement.wishlistItems })}
          href="/admin/recensioni"
          icon={<Mail size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2">
          <TopProductsTable data={data} />
        </div>

        <section className="border border-border bg-white p-6">
          <h2 className="text-lg font-semibold">{dt("storeSnapshot")}</h2>
          <p className="text-sm text-muted mt-1">{dt("quickMetrics")}</p>
          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <dt className="text-sm text-muted">{dt("totalRevenue")}</dt>
              <dd className="font-medium">{formatEuro(data.revenue.total)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <dt className="text-sm text-muted">{dt("ordersToday")}</dt>
              <dd className="font-medium">{data.orders.today}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <dt className="text-sm text-muted">{dt("prevMonth")}</dt>
              <dd className="font-medium">{formatEuro(data.revenue.previousMonth)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <dt className="text-sm text-muted">{dt("pendingReviews")}</dt>
              <dd className="font-medium flex items-center gap-2">
                <MessageSquare size={15} />
                {data.engagement.pendingReviews}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-muted">{dt("lowStockThreshold")}</dt>
              <dd className="font-medium">{data.threshold} {dt("units")}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold">{dt("recentOrders")}</h2>
            <Link
              href="/admin/ordini"
              className="text-xs uppercase tracking-widest text-muted hover:text-foreground"
            >
              {dt("viewAll")}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <DataTable>
              <table className="w-full">
                <DataTableHead>
                  <DataTableHeaderCell>{t("admin.orders.order")}</DataTableHeaderCell>
                  <DataTableHeaderCell>{t("admin.orders.customer")}</DataTableHeaderCell>
                  <DataTableHeaderCell>{t("admin.orders.date")}</DataTableHeaderCell>
                  <DataTableHeaderCell>{t("admin.orders.status")}</DataTableHeaderCell>
                  <DataTableHeaderCell>{t("admin.orders.total")}</DataTableHeaderCell>
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
                          label={getStatusLabel(t, order.status)}
                          variant={orderStatusVariant(order.status)}
                        />
                      </DataTableCell>
                      <DataTableCell>{formatEuro(order.total)}</DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </table>
            </DataTable>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold">{dt("criticalStock")}</h2>
            <Link
              href="/admin/inventario"
              className="text-xs uppercase tracking-widest text-muted hover:text-foreground"
            >
              {dt("viewAll")}
            </Link>
          </div>
          {data.lowStockVariants.length === 0 ? (
            <div className="border border-border bg-white p-6 text-sm text-muted">
              {dt("noCriticalStock")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable>
                <table className="w-full">
                  <DataTableHead>
                    <DataTableHeaderCell>{t("admin.orders.productName")}</DataTableHeaderCell>
                    <DataTableHeaderCell>{dt("variant")}</DataTableHeaderCell>
                    <DataTableHeaderCell>{dt("stock")}</DataTableHeaderCell>
                  </DataTableHead>
                  <DataTableBody>
                    {data.lowStockVariants.map((variant) => (
                      <DataTableRow key={variant.id}>
                        <DataTableCell>
                          <Link
                            href={`/admin/products/${variant.productId}`}
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
            </div>
          )}
        </section>
      </div>
    </div>
  );
}