"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/button";
import { useAdminT } from "./admin-locale-provider";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  hidePages?: boolean;
}

function pageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

export default function AdminPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  itemLabel,
  hidePages = false,
}: AdminPaginationProps) {
  const t = useAdminT();
  const ct = (k: string) => t(`admin.common.${k}`);

  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = pageNumbers(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-6 border-t border-border">
      <p className="text-sm text-muted">
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        {ct("of")} {total} {itemLabel}
      </p>

      {totalPages > 1 && !hidePages && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Pagina precedente"
          >
            <ChevronLeft size={16} />
          </Button>

          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="px-2 text-muted text-sm">
                …
              </span>
            ) : (
              <Button
                key={p}
                type="button"
                variant={p === page ? "primary" : "outline"}
                size="sm"
                className="min-w-[2.25rem]"
                onClick={() => onPageChange(p)}
                aria-label={`Pagina ${p}`}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </Button>
            )
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Pagina successiva"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}