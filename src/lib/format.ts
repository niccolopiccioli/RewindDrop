export function formatEuro(value: number, compact = false) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2,
  }).format(value);
}

export function formatPercent(value: number | null) {
  if (value === null) return "—";
  const formatted = new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(value);
  return `${formatted}%`;
}

export function formatShortDate(isoDate: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${isoDate}T12:00:00`));
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}