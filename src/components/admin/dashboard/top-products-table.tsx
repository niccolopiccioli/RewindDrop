"use client";

import Link from "next/link";
import { formatEuro } from "@/lib/format";
import type { AdminAnalytics } from "@/lib/admin-analytics";
import DataTable, {
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from "@/components/admin/data-table";
import { useAdminT } from "@/components/admin/admin-locale-provider";

export default function TopProductsTable({ data }: { data: AdminAnalytics }) {
  const t = useAdminT();
  const dt = (k: string) => t(`admin.dashboard.${k}`);

  const rows = data.topProductsByRevenue.length > 0
    ? data.topProductsByRevenue
    : data.topProductsByQuantity;

  return (
    <section className="border border-border bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold">{dt("topProducts")}</h2>
          <p className="text-sm text-muted mt-1">{dt("topProductsSub")}</p>
        </div>
        <Link
          href="/admin/products"
          className="text-xs uppercase tracking-widest text-muted hover:text-foreground"
        >
          {dt("viewCatalog")}
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted">{dt("noSales")}</p>
      ) : (
        <div className="overflow-x-auto">
          <DataTable>
            <table className="w-full">
              <DataTableHead>
                <DataTableHeaderCell>{t("admin.orders.productName")}</DataTableHeaderCell>
                <DataTableHeaderCell>{dt("pieces")}</DataTableHeaderCell>
                <DataTableHeaderCell>{dt("revenue")}</DataTableHeaderCell>
              </DataTableHead>
              <DataTableBody>
                {rows.map((product, index) => (
                  <DataTableRow key={product.productId}>
                    <DataTableCell>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-muted w-4 shrink-0">{index + 1}</span>
                        <Link
                          href={`/admin/products/${product.productId}`}
                          className="truncate font-medium hover:text-muted transition-colors"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </DataTableCell>
                    <DataTableCell>{product.quantity}</DataTableCell>
                    <DataTableCell>{formatEuro(product.revenue)}</DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </table>
          </DataTable>
        </div>
      )}
    </section>
  );
}