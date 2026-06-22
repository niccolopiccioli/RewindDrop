"use client";

import { formatEuro, formatShortDate } from "@/lib/format";
import type { DailyMetric } from "@/lib/admin-analytics";
import { useAdminT } from "@/components/admin/admin-locale-provider";

export default function RevenueChart({ data }: { data: DailyMetric[] }) {
  const t = useAdminT();
  const dt = (k: string) => t(`admin.dashboard.${k}`);
  const maxRevenue = Math.max(...data.map((day) => day.revenue), 1);
  const totalRevenue = data.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = data.reduce((sum, day) => sum + day.orders, 0);

  return (
    <section className="border border-border bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold">{dt("revenueChart")}</h2>
          <p className="text-sm text-muted mt-1">{dt("revenueChartSub")}</p>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted">{dt("period")}</p>
            <p className="font-medium">{formatEuro(totalRevenue)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted">{dt("orders")}</p>
            <p className="font-medium">{totalOrders}</p>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-52 overflow-x-auto pb-2">
        {data.map((day, index) => {
          const height = Math.max((day.revenue / maxRevenue) * 100, day.revenue > 0 ? 4 : 0);
          const showLabel = index % 5 === 0 || index === data.length - 1;

          return (
            <div
              key={day.date}
              className="group flex-1 min-w-0 flex flex-col items-center gap-2 h-full"
            >
              <div className="relative w-full flex-1 flex items-end">
                <div
                  className="w-full bg-foreground/90 transition-opacity group-hover:bg-foreground"
                  style={{ height: `${height}%` }}
                  title={`${formatShortDate(day.date)} · ${formatEuro(day.revenue)} · ${day.orders} ${dt("orders").toLowerCase()}`}
                />
              </div>
              {showLabel && (
                <span className="text-[10px] text-muted uppercase tracking-wide truncate w-full text-center">
                  {formatShortDate(day.date)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}