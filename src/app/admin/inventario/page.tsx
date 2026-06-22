"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/page-header";
import DataTable, {
  DataTableHead, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell,
} from "@/components/admin/data-table";
import StatusBadge from "@/components/admin/status-badge";
import Button from "@/components/ui/button";
import { useAdminT } from "@/components/admin/admin-locale-provider";

type Variant = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  productId: string;
  product: { name: string; slug: string };
};

export default function InventarioPage() {
  const t = useAdminT();
  const it = (k: string) => t(`admin.inventory.${k}`);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/inventory")
      .then((r) => r.json())
      .then((data) => {
        setVariants(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const adjustStock = async (productId: string, variantId: string, delta: number) => {
    await fetch(`/api/admin/products/${productId}/variants/${variantId}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: delta > 0 ? "increment" : "decrement", value: Math.abs(delta) }),
    });
    const res = await fetch("/api/admin/inventory");
    const data = await res.json();
    setVariants(Array.isArray(data) ? data : []);
  };

  return (
    <div>
      <PageHeader title={it("title")} description={it("description")} />
      {loading ? (
        <p className="text-sm text-muted">{t("admin.common.loading")}</p>
      ) : variants.length === 0 ? (
        <p className="text-sm text-muted">{it("noVariants")}</p>
      ) : (
        <div className="overflow-x-auto">
          <DataTable>
            <table className="w-full min-w-[500px]">
              <DataTableHead>
                <DataTableHeaderCell>{it("product")}</DataTableHeaderCell>
                <DataTableHeaderCell>{it("sku")}</DataTableHeaderCell>
                <DataTableHeaderCell>{it("stock")}</DataTableHeaderCell>
                <DataTableHeaderCell>{it("actions")}</DataTableHeaderCell>
              </DataTableHead>
              <DataTableBody>
                {variants.map((v) => (
                  <DataTableRow key={v.id}>
                    <DataTableCell>
                      <Link href={`/admin/products/${v.productId}`} className="hover:underline">
                        {v.product.name} — {v.name}
                      </Link>
                    </DataTableCell>
                    <DataTableCell>{v.sku}</DataTableCell>
                    <DataTableCell>
                      <StatusBadge
                        label={String(v.stock)}
                        variant={v.stock === 0 ? "danger" : "warning"}
                      />
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => adjustStock(v.productId, v.id, 1)}>+1</Button>
                        <Button size="sm" variant="outline" onClick={() => adjustStock(v.productId, v.id, 10)}>+10</Button>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </table>
          </DataTable>
        </div>
      )}
    </div>
  );
}