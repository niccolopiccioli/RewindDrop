export default function ProductBadge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "sale" | "new";
}) {
  const styles = {
    default: "bg-foreground text-white",
    sale: "bg-foreground text-white",
    new: "bg-white text-foreground border border-foreground",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium ${styles[variant]}`}
    >
      {label}
    </span>
  );
}
