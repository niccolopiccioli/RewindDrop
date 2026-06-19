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

export function DataTableHeaderCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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
