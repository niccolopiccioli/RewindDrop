"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Eye, EyeOff, Copy, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import DataTable, {
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  type SortDirection,
} from "@/components/admin/data-table";
import StatusBadge from "@/components/admin/status-badge";
import EmptyState from "@/components/admin/empty-state";
import AdminPagination from "@/components/admin/pagination";
import Button from "@/components/ui/button";
import { Package } from "lucide-react";

const PAGE_SIZE = 15;

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

type SortField = "sku" | "category" | "price" | "stock" | "active" | "createdAt";

export default function AdminProductsPage() {
  const router = useRouter();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortField | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectAllLoading, setSelectAllLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  /** Stato visibilità al momento della selezione (anche su altre pagine) */
  const [selectedMeta, setSelectedMeta] = useState<
    Map<string, { active: boolean }>
  >(new Map());

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
    if (search) params.set("search", search);
    if (sort) {
      params.set("sort", sort);
      params.set("order", sortDirection);
    }
    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotal(data.pagination?.total ?? 0);
    setTotalPages(data.pagination?.totalPages ?? 1);
    setLoading(false);
  }, [search, sort, sortDirection, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSelectedMeta((prev) => {
      const next = new Map(prev);
      for (const p of products) {
        if (next.has(p.id)) {
          next.set(p.id, { active: p.active });
        }
      }
      return next;
    });
  }, [products]);

  const allSelected = total > 0 && selectedIds.size === total;
  const someSelected = selectedIds.size > 0 && selectedIds.size < total;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected, total]);

  const selectedList = [...selectedIds];
  const hideEligible = selectedList.filter(
    (id) => selectedMeta.get(id)?.active === true
  ).length;
  const showEligible = selectedList.filter(
    (id) => selectedMeta.get(id)?.active === false
  ).length;

  const toggleSelect = (product: Product, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(product.id);
      else next.delete(product.id);
      return next;
    });
    setSelectedMeta((prev) => {
      const next = new Map(prev);
      if (checked) next.set(product.id, { active: product.active });
      else next.delete(product.id);
      return next;
    });
  };

  const toggleSelectAll = async (checked: boolean) => {
    if (!checked) {
      clearSelection();
      return;
    }

    setSelectAllLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/products/ids?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      const items: { id: string; active: boolean }[] = data.products ?? [];
      setSelectedIds(new Set(items.map((p) => p.id)));
      setSelectedMeta(
        new Map(items.map((p) => [p.id, { active: p.active }]))
      );
    } finally {
      setSelectAllLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectedMeta(new Map());
  };

  const applySearch = () => {
    setSearch(searchDraft.trim());
    setPage(1);
    clearSelection();
  };

  const handleSort = (key: string) => {
    const sortKey = key as SortField;
    setPage(1);
    clearSelection();

    if (sort === sortKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc" && sortKey !== "createdAt") {
        setSort(null);
        setSortDirection("desc");
      } else {
        setSortDirection("asc");
      }
    } else {
      setSort(sortKey);
      setSortDirection("asc");
    }
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const runBulkVisibility = async (action: "hide" | "show") => {
    const ids =
      action === "hide"
        ? selectedList.filter((id) => selectedMeta.get(id)?.active === true)
        : selectedList.filter((id) => selectedMeta.get(id)?.active === false);

    if (ids.length === 0) return;

    const label =
      action === "hide"
        ? `Nascondere ${ids.length} prodott${ids.length === 1 ? "o" : "i"} dall'esposizione?`
        : `Mostrare ${ids.length} prodott${ids.length === 1 ? "o" : "i"} in esposizione?`;

    if (!confirm(label)) return;

    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/products/bulk-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operazione fallita");
      clearSelection();
      await fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Operazione fallita");
    } finally {
      setBulkLoading(false);
    }
  };

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

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Eliminare definitivamente "${name}"? L'operazione non può essere annullata.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}?hard=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eliminazione fallita");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setSelectedMeta((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      await fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Eliminazione fallita");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "Eliminare definitivamente tutti i prodotti del catalogo? I prodotti presenti in ordini o carrelli verranno saltati."
      )
    ) {
      return;
    }

    setDeletingAll(true);
    try {
      const res = await fetch("/api/admin/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eliminazione fallita");
      clearSelection();
      await fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Eliminazione fallita");
    } finally {
      setDeletingAll(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm("Duplicare questo prodotto come bozza?")) return;

    setDuplicatingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Duplicazione fallita");
      router.push(data.redirectUrl || `/admin/prodotti/${data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Duplicazione fallita");
    } finally {
      setDuplicatingId(null);
    }
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

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 w-full">
        <div className="flex gap-4 max-w-xl min-w-[min(100%,280px)]">
          <input
            type="text"
            placeholder="Cerca per nome o SKU..."
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applySearch();
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <Button variant="outline" onClick={applySearch}>
            Cerca
          </Button>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-2 ml-auto">
            <span className="text-sm text-muted">
              {selectedIds.size} selezionat{selectedIds.size === 1 ? "o" : "i"}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={hideEligible === 0 || bulkLoading}
              loading={bulkLoading}
              onClick={() => runBulkVisibility("hide")}
              title={
                hideEligible === 0
                  ? "Nessun prodotto visibile da nascondere nella selezione"
                  : undefined
              }
            >
              <EyeOff size={14} className="mr-1.5" />
              Nascondi{hideEligible > 0 ? ` (${hideEligible})` : ""}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={showEligible === 0 || bulkLoading}
              onClick={() => runBulkVisibility("show")}
              title={
                showEligible === 0
                  ? "Nessun prodotto nascosto da mostrare nella selezione"
                  : undefined
              }
            >
              <Eye size={14} className="mr-1.5" />
              Mostra{showEligible > 0 ? ` (${showEligible})` : ""}
            </Button>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-muted hover:text-foreground underline-offset-2 hover:underline"
            >
              Deseleziona tutto
            </button>
          </div>
        )}
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
        <>
          <DataTable>
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[3%]" />
                <col className="w-[24%]" />
                <col className="w-[11%]" />
                <col className="w-[11%]" />
                <col className="w-[8%]" />
                <col className="w-[6%]" />
                <col className="w-[9%]" />
                <col className="w-[28%]" />
              </colgroup>
              <DataTableHead>
                <th className="w-10 px-2 py-3">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    disabled={selectAllLoading || total === 0}
                    onChange={(e) => void toggleSelectAll(e.target.checked)}
                    aria-label="Seleziona tutti i prodotti"
                    className="rounded border-border size-4 accent-foreground disabled:opacity-50"
                  />
                </th>
                <DataTableHeaderCell className="px-2">Nome</DataTableHeaderCell>
                <DataTableHeaderCell
                  className="px-2 whitespace-nowrap"
                  sortable
                  sortKey="sku"
                  activeSort={sort}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  SKU
                </DataTableHeaderCell>
                <DataTableHeaderCell
                  className="px-2 whitespace-nowrap"
                  sortable
                  sortKey="category"
                  activeSort={sort}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Categoria
                </DataTableHeaderCell>
                <DataTableHeaderCell
                  className="px-2 whitespace-nowrap"
                  sortable
                  sortKey="price"
                  activeSort={sort}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Prezzo
                </DataTableHeaderCell>
                <DataTableHeaderCell
                  className="px-2 whitespace-nowrap"
                  sortable
                  sortKey="stock"
                  activeSort={sort}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Stock
                </DataTableHeaderCell>
                <DataTableHeaderCell
                  className="px-2 whitespace-nowrap"
                  sortable
                  sortKey="active"
                  activeSort={sort}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Stato
                </DataTableHeaderCell>
                <DataTableHeaderCell className="px-3">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      className="shrink-0"
                      loading={deletingAll}
                      onClick={() => void handleDeleteAll()}
                    >
                      Elimina tutto
                    </Button>
                  </div>
                </DataTableHeaderCell>
              </DataTableHead>
              <DataTableBody>
                {products.map((product) => (
                  <DataTableRow
                    key={product.id}
                    className={!product.active ? "opacity-60" : ""}
                  >
                    <DataTableCell className="w-10 px-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={(e) =>
                          toggleSelect(product, e.target.checked)
                        }
                        aria-label={`Seleziona ${product.name}`}
                        className="rounded border-border size-4 accent-foreground"
                      />
                    </DataTableCell>
                    <DataTableCell className="px-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link
                          href={`/admin/prodotti/${product.id}`}
                          className="truncate font-medium hover:text-muted transition-colors"
                        >
                          {product.name}
                        </Link>
                        {product.featured && (
                          <StatusBadge label="In evidenza" variant="info" />
                        )}
                      </div>
                    </DataTableCell>
                    <DataTableCell className="px-2 truncate">{product.sku}</DataTableCell>
                    <DataTableCell className="px-2 truncate">{product.category.name}</DataTableCell>
                    <DataTableCell className="px-2 whitespace-nowrap">€{product.price.toFixed(2)}</DataTableCell>
                    <DataTableCell className="px-2 whitespace-nowrap">{product.totalStock}</DataTableCell>
                    <DataTableCell className="px-2">
                      <StatusBadge
                        label={product.active ? "Visibile" : "Nascosto"}
                        variant={product.active ? "success" : "neutral"}
                      />
                    </DataTableCell>
                    <DataTableCell className="px-3">
                      <div className="grid grid-cols-4 items-center justify-items-center w-full">
                        <Link href={`/admin/prodotti/${product.id}`}>
                          <Button variant="ghost" size="sm">
                            <Pencil size={16} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Duplica prodotto"
                          loading={duplicatingId === product.id}
                          onClick={() => handleDuplicate(product.id)}
                        >
                          <Copy size={16} />
                        </Button>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Elimina prodotto"
                          loading={deletingId === product.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </table>
          </DataTable>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
