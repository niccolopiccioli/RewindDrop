type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-foreground text-white",
  warning: "bg-surface text-foreground border border-border",
  danger: "bg-red-600 text-white",
  neutral: "bg-surface text-muted border border-border",
  info: "bg-foreground text-white",
};

export default function StatusBadge({ label, variant = "neutral" }: { label: string; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium ${variantStyles[variant]}`}>
      {label}
    </span>
  );
}

export function orderStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "DELIVERED": case "PAID": return "success";
    case "SHIPPED": case "PROCESSING": return "info";
    case "PENDING": return "warning";
    case "CANCELLED": case "REFUNDED": return "danger";
    default: return "neutral";
  }
}

export const orderStatusLabels: Record<string, string> = {
  PENDING: "In attesa", PROCESSING: "In lavorazione", PAID: "Pagato",
  SHIPPED: "Spedito", DELIVERED: "Consegnato", CANCELLED: "Annullato", REFUNDED: "Rimborsato",
};