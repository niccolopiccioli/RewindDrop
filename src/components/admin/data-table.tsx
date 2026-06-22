import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export default function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border bg-white overflow-hidden">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function DataTableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-surface border-b border-border"><tr>{children}</tr></thead>;
}

export type SortDirection = "asc" | "desc";

interface DataTableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortKey?: string;
  activeSort?: string | null;
  sortDirection?: SortDirection;
  onSort?: (key: string) => void;
}

export function DataTableHeaderCell({
  children,
  className = "",
  sortable = false,
  sortKey,
  activeSort,
  sortDirection = "desc",
  onSort,
}: DataTableHeaderCellProps) {
  const isActive = sortable && sortKey && activeSort === sortKey;

  const content = (
    <>
      <span>{children}</span>
      {sortable && sortKey && (
        <span className="inline-flex text-muted">
          {!isActive && <ArrowUpDown size={12} />}
          {isActive && sortDirection === "asc" && <ArrowUp size={12} />}
          {isActive && sortDirection === "desc" && <ArrowDown size={12} />}
        </span>
      )}
    </>
  );

  if (sortable && sortKey && onSort) {
    return (
      <th className={`px-4 py-3 text-left ${className}`}>
        <button
          type="button"
          onClick={() => onSort(sortKey)}
          className={`inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest transition-colors hover:text-foreground ${
            isActive ? "text-foreground" : "text-muted"
          }`}
        >
          {content}
        </button>
      </th>
    );
  }

  return (
    <th className={`px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-muted ${className}`}>
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function DataTableRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <tr className={`hover:bg-surface/50 transition-colors ${className}`}>{children}</tr>;
}

export function DataTableCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>;
}
