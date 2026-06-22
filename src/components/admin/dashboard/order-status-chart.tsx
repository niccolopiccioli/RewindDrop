import type { StatusMetric } from "@/lib/admin-analytics";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500",
  PROCESSING: "bg-blue-500",
  PAID: "bg-emerald-600",
  SHIPPED: "bg-violet-600",
  DELIVERED: "bg-foreground",
  CANCELLED: "bg-red-500",
  REFUNDED: "bg-orange-500",
};

export default function OrderStatusChart({ data }: { data: StatusMetric[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="border border-border bg-white p-6 h-full">
      <h2 className="text-lg font-semibold">Stato ordini</h2>
      <p className="text-sm text-muted mt-1">Distribuzione per stato operativo</p>

      <div className="mt-6 space-y-4">
        {data.map((item) => {
          const width = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={item.status}>
              <div className="flex items-center justify-between gap-3 text-sm mb-1.5">
                <span>{item.label}</span>
                <span className="text-muted">
                  {item.count} · {total > 0 ? width.toFixed(0) : 0}%
                </span>
              </div>
              <div className="h-2 bg-surface overflow-hidden">
                <div
                  className={`h-full ${STATUS_COLORS[item.status] || "bg-foreground"}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
