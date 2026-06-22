"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Eye, EyeOff, Copy, Trash2, Star, ArrowUp, ArrowDown } from "lucide-react";
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
import { useAdminT } from "@/components/admin/admin-locale-provider";

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
  const t = useAdminT();
  const pt = (k: string, vars?: Record<string, string | number>) => t(`admin.products.${k}`, vars);
  const ct = (k: string, vars?: Record<string, string | number>) => t(`admin.common.${k}`, vars);
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
    const sortKey = key === "name" ? "createdAt" : (key as SortField);
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

    const label = action === "hide"
      ? pt("hideConfirm", { count: ids.length })
      : pt("showConfirm", { count: ids.length });

    if (!confirm(label)) return;

    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/products/bulk-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || ct("error"));
      clearSelection();
      await fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : ct("error"));
    } finally {
      setBulkLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    const message = currentlyActive
      ? pt("toggleHideConfirm")
      : pt("toggleShowConfirm");
    if (!confirm(message)) return;

    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentlyActive }),
    });
    fetchProducts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(pt("deleteConfirm", { name }))) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}?hard=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || pt("deleteFailed"));
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
      alert(err instanceof Error ? err.message : pt("deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(pt("deleteAllConfirm"))) return;

    setDeletingAll(true);
    try {
      const res = await fetch("/api/admin/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || pt("deleteFailed"));
      clearSelection();
      await fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : pt("deleteFailed"));
    } finally {
      setDeletingAll(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!confirm(pt("duplicateConfirm"))) return;

    setDuplicatingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || pt("duplicateFailed"));
      router.push(data.redirectUrl || `/admin/products/${data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : pt("duplicateFailed"));
    } finally {
      setDuplicatingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <h1 className="text-display text-xl md:text-2xl font-semibold break-words">{pt("title")}</h1>
          <p className="text-xs text-muted mt-1 uppercase tracking-widest break-words">{pt("description")}</p>
        </div>
        <Link href="/admin/products/nuovo" className="shrink-0">
          <Button>
            <Plus size={18} className="mr-1" />
            {pt("newProduct")}
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 w-full">
        <div className="flex gap-4 w-full sm:w-auto max-w-xl min-w-0">
          <input
            type="text"
            placeholder={pt("searchPlaceholder")}
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applySearch();
            }}
            className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
          />
          <Button variant="outline" onClick={applySearch} className="shrink-0">
            {ct("search")}
          </Button>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 w-full sm:w-auto">
            <span className="text-sm text-muted mr-2">
              {ct("selected", { count: selectedIds.size })}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={hideEligible === 0 || bulkLoading}
              loading={bulkLoading}
              onClick={() => runBulkVisibility("hide")}
              title={hideEligible === 0 ? pt("hideTooltip") : undefined}
            >
              <EyeOff size={14} className="mr-1.5" />
              {pt("hide")}{hideEligible > 0 ? ` (${hideEligible})` : ""}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={showEligible === 0 || bulkLoading}
              onClick={() => runBulkVisibility("show")}
              title={showEligible === 0 ? pt("showTooltip") : undefined}
            >
              <Eye size={14} className="mr-1.5" />
              {pt("show")}{showEligible > 0 ? ` (${showEligible})` : ""}
            </Button>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-muted hover:text-foreground underline-offset-2 hover:underline"
            >
              {ct("deselectAll")}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">{ct("loading")}</p>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={pt("noProducts")}
          description={pt("noProductsHint")}
          action={
            <Link href="/admin/products/nuovo">
              <Button>
                <Plus size={18} className="mr-1" />
                {pt("newProduct")}
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Mobile sort bar */}
          <div className="block sm:hidden mb-3 -mx-1">
            <div className="flex gap-1 overflow-x-auto pb-2 px-1">
              {[
                { key: "name", label: pt("name") },
                { key: "sku", label: pt("sku") },
                { key: "category", label: pt("category") },
                { key: "price", label: pt("price") },
                { key: "stock", label: pt("stock") },
                { key: "active", label: pt("status") },
              ].map(({ key, label }) => {
                const isActive = key === "name"
                  ? sort === null || sort === "createdAt"
                  : sort === key;
                const isAsc = key === "name"
                  ? sort === "createdAt" && sortDirection === "asc"
                  : sort === key && sortDirection === "asc";
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSort(key)}
                    className={`flex items-center gap-0.5 px-1.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-md border whitespace-nowrap transition-colors shrink-0 ${
                      isActive
                        ? "bg-foreground text-white border-foreground"
                        : "border-border text-muted hover:text-foreground hover:border-foreground"
                    }`}
                  >
                    {label}
                    {isActive && (isAsc ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile cards */}
          <div className="block sm:hidden space-y-3 mb-6">
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-white border border-border rounded-lg p-4 ${
                  !product.active ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={(e) => toggleSelect(product, e.target.checked)}
                    aria-label={`${ct("selectAll")} ${product.name}`}
                    className="rounded border-border size-4 accent-foreground shrink-0"
                  />
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="truncate font-medium text-sm hover:text-muted transition-colors min-w-0 flex-1"
                  >
                    {product.name}
                  </Link>
                  {product.featured && (
                    <Star size={14} className="shrink-0 fill-amber-400 text-amber-400" />
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted min-w-0">
                  <span className="truncate">{product.category.name}</span>
                  <span className="shrink-0">·</span>
                  <span className="truncate">{product.sku}</span>
                  <span className="shrink-0">·</span>
                  <span className="whitespace-nowrap shrink-0">€{product.price.toFixed(2)}</span>
                  <span className="shrink-0">·</span>
                  <span className="whitespace-nowrap shrink-0">{product.totalStock} pz</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <StatusBadge
                    label={product.active ? pt("visible") : pt("hidden")}
                    variant={product.active ? "success" : "neutral"}
                  />
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/products/${product.id}`}>
                      <Button variant="ghost" size="sm">
                        <Pencil size={16} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      title={pt("duplicate")}
                      loading={duplicatingId === product.id}
                      onClick={() => handleDuplicate(product.id)}
                    >
                      <Copy size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title={product.active ? pt("toggleHideConfirm") : pt("toggleShowConfirm")}
                      onClick={() => handleToggleActive(product.id, product.active)}
                    >
                      {product.active ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title={pt("delete")}
                      loading={deletingId === product.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <div className="overflow-x-auto">
              <DataTable>
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-10 sm:w-[3%]" />
                  <col className="w-[24%]" />
                  <col className="hidden sm:table-column w-[11%]" />
                  <col className="hidden sm:table-column w-[11%]" />
                  <col className="w-[8%]" />
                  <col className="w-[6%]" />
                  <col className="hidden sm:table-column w-[9%]" />
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
                      aria-label={ct("selectAll")}
                      className="rounded border-border size-4 accent-foreground disabled:opacity-50"
                    />
                  </th>
                  <DataTableHeaderCell className="px-2">{pt("name")}</DataTableHeaderCell>
                  <DataTableHeaderCell
                    className="px-2 whitespace-nowrap hidden sm:table-cell"
                    sortable
                    sortKey="sku"
                    activeSort={sort}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    {pt("sku")}
                  </DataTableHeaderCell>
                  <DataTableHeaderCell
                    className="px-2 whitespace-nowrap hidden sm:table-cell"
                    sortable
                    sortKey="category"
                    activeSort={sort}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    {pt("category")}
                  </DataTableHeaderCell>
                  <DataTableHeaderCell
                    className="px-2 whitespace-nowrap hidden sm:table-cell"
                    sortable
                    sortKey="price"
                    activeSort={sort}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    {pt("price")}
                  </DataTableHeaderCell>
                  <DataTableHeaderCell
                    className="px-2 whitespace-nowrap"
                    sortable
                    sortKey="stock"
                    activeSort={sort}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    {pt("stock")}
                  </DataTableHeaderCell>
                  <DataTableHeaderCell
                    className="px-2 whitespace-nowrap hidden sm:table-cell"
                    sortable
                    sortKey="active"
                    activeSort={sort}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    {pt("status")}
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
                        {pt("deleteAll")}
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
                          aria-label={`${ct("selectAll")} ${product.name}`}
                          className="rounded border-border size-4 accent-foreground"
                        />
                      </DataTableCell>
                      <DataTableCell className="px-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="truncate font-medium hover:text-muted transition-colors text-sm"
                          >
                            {product.name}
                          </Link>
                          {product.featured && (
                            <Star size={14} className="shrink-0 fill-amber-400 text-amber-400" />
                          )}
                        </div>
                      </DataTableCell>
                      <DataTableCell className="px-2 truncate hidden sm:table-cell text-sm">{product.sku}</DataTableCell>
                      <DataTableCell className="px-2 truncate hidden sm:table-cell text-sm">{product.category.name}</DataTableCell>
                      <DataTableCell className="px-2 whitespace-nowrap text-sm">€{product.price.toFixed(2)}</DataTableCell>
                      <DataTableCell className="px-2 whitespace-nowrap text-sm">{product.totalStock}</DataTableCell>
                      <DataTableCell className="px-2 hidden sm:table-cell">
                        <StatusBadge
                          label={product.active ? pt("visible") : pt("hidden")}
                          variant={product.active ? "success" : "neutral"}
                        />
                      </DataTableCell>
                      <DataTableCell className="px-3">
                        <div className="flex items-center justify-end gap-1 sm:gap-0 sm:grid sm:grid-cols-4 sm:justify-items-center sm:w-full">
                          <Link href={`/admin/products/${product.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil size={16} />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={pt("duplicate")}
                            loading={duplicatingId === product.id}
                            onClick={() => handleDuplicate(product.id)}
                          >
                            <Copy size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={product.active ? pt("toggleHideConfirm") : pt("toggleShowConfirm")}
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
                            title={pt("delete")}
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
          </div>
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={PAGE_SIZE}
            onPageChange={handlePageChange}
            itemLabel={ct("of")}
          />
        </>
      )}
    </div>
  );
}