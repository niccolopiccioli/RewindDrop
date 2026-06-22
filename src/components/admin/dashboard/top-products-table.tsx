import Link from "next/link";
import { formatEuro, type RankedProduct } from "@/lib/admin-analytics";
import DataTable, {
  DataTableHead,
  DataTableHeaderCell,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from "@/components/admin/data-table";

export default function TopProductsTable({
  byRevenue,
  byQuantity,
}: {
  byRevenue: RankedProduct[];
  byQuantity: RankedProduct[];
}) {
  const rows = byRevenue.length > 0 ? byRevenue : byQuantity;

  return (
    <section className="border border-border bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Top prodotti</h2>
          <p className="text-sm text-muted mt-1">Best seller per fatturato</p>
        </div>
        <Link
          href="/admin/prodotti"
          className="text-xs uppercase tracking-widest text-muted hover:text-foreground"
        >
          Vedi catalogo
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted">Nessuna vendita registrata.</p>
      ) : (
        <DataTable>
          <table className="w-full">
            <DataTableHead>
              <DataTableHeaderCell>Prodotto</DataTableHeaderCell>
              <DataTableHeaderCell>Pezzi</DataTableHeaderCell>
              <DataTableHeaderCell>Fatturato</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {rows.map((product, index) => (
                <DataTableRow key={product.productId}>
                  <DataTableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-muted w-4">{index + 1}</span>
                      <Link
                        href={`/admin/prodotti/${product.productId}`}
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
      )}
    </section>
  );
}
