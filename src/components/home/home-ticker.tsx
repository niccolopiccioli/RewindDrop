const ITEMS = [
  "Nuovi arrivi",
  "Drop limitati",
  "Sneakers heat",
  "Streetwear curato",
  "Milano 2026",
  "RewindDrop",
];

export default function HomeTicker() {
  const loop = [...ITEMS, ...ITEMS];

  return (
    <div
      className="border-y border-foreground bg-foreground text-background overflow-hidden"
      aria-hidden
    >
      <div className="flex w-max animate-home-ticker motion-reduce:animate-none">
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-6 px-6 py-3 text-[11px] sm:text-xs uppercase tracking-[0.35em] whitespace-nowrap"
          >
            {item}
            <span className="text-background/30">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
