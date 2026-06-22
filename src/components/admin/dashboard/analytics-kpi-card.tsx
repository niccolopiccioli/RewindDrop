"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { formatPercent } from "@/lib/format";
import { useAdminT } from "@/components/admin/admin-locale-provider";

type AnalyticsKpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  change?: number | null;
  href?: string;
  icon: React.ReactNode;
};

export default function AnalyticsKpiCard({
  label,
  value,
  hint,
  change,
  href,
  icon,
}: AnalyticsKpiCardProps) {
  const t = useAdminT();
  const dt = (k: string) => t(`admin.dashboard.${k}`);

  const content = (
    <div className="h-full border border-border bg-white p-4 sm:p-5 transition-colors hover:border-foreground/40">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted">
            {label}
          </p>
          <p className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted break-words">{hint}</p>}
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground">
          {icon}
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {change === null ? (
            <span className="inline-flex items-center gap-1 text-muted">
              <Minus size={14} />
              {dt("noComparison")}
            </span>
          ) : change >= 0 ? (
            <span className="inline-flex items-center gap-1 text-green-700">
              <ArrowUpRight size={14} />
              {formatPercent(change)} {dt("vsLastMonth")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-red-600">
              <ArrowDownRight size={14} />
              {formatPercent(change)} {dt("vsLastMonth")}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}