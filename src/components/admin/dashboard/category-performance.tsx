import Link from "next/link";
import { formatEuro, type CategoryMetric } from "@/lib/admin-analytics";

export default function CategoryPerformance({
  data,
}: {
  data: CategoryMetric[];
}) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);

  return (
    <section className="border border-border bg-white p-6 h-full">
      <h2 className="text-lg font-semibold">Performance categorie</h2>
      <p className="text-sm text-muted mt-1">Fatturato per categoria</p>

      {data.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Nessun dato di vendita disponibile.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {data.map((item) => (
            <div key={item.categoryId}>
              <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
                <Link
                  href="/admin/categorie"
                  className="font-medium hover:text-muted transition-colors"
                >
                  {item.name}
                </Link>
                <span className="text-muted">{formatEuro(item.revenue)}</span>
              </div>
              <div className="h-2 bg-surface overflow-hidden">
                <div
                  className="h-full bg-foreground/80"
                  style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
