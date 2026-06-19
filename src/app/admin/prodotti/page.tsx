"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import DataTable, {
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from "@/components/admin/data-table";
import StatusBadge from "@/components/admin/status-badge";
import EmptyState from "@/components/admin/empty-state";
import Button from "@/components/ui/button";
import { Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  active: boolean;
  featured: boolean;
  totalStock: number;
  category: { name: string };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    const message = currentlyActive
      ? "Rimuovere questo prodotto dall'esposizione?"
      : "Rimettere questo prodotto in esposizione?";
    if (!confirm(message)) return;

    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentlyActive }),
    });
    fetchProducts();
  };

  return (
    <div>
      <PageHeader
        title="Prodotti"
        description="Gestisci il catalogo prodotti"
        action={
          <Link href="/admin/prodotti/nuovo">
            <Button>
              <Plus size={18} className="mr-1" />
              Nuovo prodotto
            </Button>
          </Link>
        }
      />

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Cerca per nome o SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
        <Button variant="outline" onClick={fetchProducts}>
          Cerca
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Caricamento...</p>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nessun prodotto"
          description="Crea il tuo primo prodotto per iniziare."
          action={
            <Link href="/admin/prodotti/nuovo">
              <Button>
                <Plus size={18} className="mr-1" />
                Nuovo prodotto
              </Button>
            </Link>
          }
        />
      ) : (
        <DataTable>
          <table className="w-full">
            <DataTableHead>
              <DataTableHeaderCell>Nome</DataTableHeaderCell>
              <DataTableHeaderCell>SKU</DataTableHeaderCell>
              <DataTableHeaderCell>Categoria</DataTableHeaderCell>
              <DataTableHeaderCell>Prezzo</DataTableHeaderCell>
              <DataTableHeaderCell>Stock</DataTableHeaderCell>
              <DataTableHeaderCell>Stato</DataTableHeaderCell>
              <DataTableHeaderCell>Azioni</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {products.map((product) => (
                <DataTableRow key={product.id}>
                  <DataTableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      {product.name}
                      {product.featured && (
                        <StatusBadge label="In evidenza" variant="info" />
                      )}
                    </span>
                  </DataTableCell>
                  <DataTableCell>{product.sku}</DataTableCell>
                  <DataTableCell>{product.category.name}</DataTableCell>
                  <DataTableCell>€{product.price.toFixed(2)}</DataTableCell>
                  <DataTableCell>{product.totalStock}</DataTableCell>
                  <DataTableCell>
                    <StatusBadge
                      label={product.active ? "Attivo" : "Inattivo"}
                      variant={product.active ? "success" : "neutral"}
                    />
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex gap-2">
                      <Link href={`/admin/prodotti/${product.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        title={
                          product.active
                            ? "Rimuovi dall'esposizione"
                            : "Rimetti in esposizione"
                        }
                        onClick={() =>
                          handleToggleActive(product.id, product.active)
                        }
                      >
                        {product.active ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </Button>
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
