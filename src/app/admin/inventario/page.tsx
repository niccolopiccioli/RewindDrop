"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/page-header";
import DataTable, {
  DataTableHead, DataTableHeaderCell, DataTableBody, DataTableRow, DataTableCell,
} from "@/components/admin/data-table";
import StatusBadge from "@/components/admin/status-badge";
import Button from "@/components/ui/button";

type Variant = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  productId: string;
  product: { name: string; slug: string };
};

export default function InventarioPage() {
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
      <PageHeader title="Inventario" description="Varianti con stock sotto soglia" />
      {loading ? (
        <p className="text-sm text-muted">Caricamento...</p>
      ) : variants.length === 0 ? (
        <p className="text-sm text-muted">Nessuna variante sotto soglia.</p>
      ) : (
        <DataTable>
          <table className="w-full">
            <DataTableHead>
              <DataTableHeaderCell>Prodotto</DataTableHeaderCell>
              <DataTableHeaderCell>SKU</DataTableHeaderCell>
              <DataTableHeaderCell>Stock</DataTableHeaderCell>
              <DataTableHeaderCell>Azioni</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {variants.map((v) => (
                <DataTableRow key={v.id}>
                  <DataTableCell>
                    <Link href={`/admin/prodotti/${v.productId}`} className="hover:underline">
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
      )}
    </div>
  );
}
