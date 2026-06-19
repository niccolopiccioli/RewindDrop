export default function SizePills({ sizes }: { sizes: string[] }) {
  if (sizes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {sizes.map((size) => (
        <span
          key={size}
          className="px-2 py-0.5 text-[10px] uppercase tracking-wider border border-border text-muted"
        >
          {size}
        </span>
      ))}
    </div>
  );
}
