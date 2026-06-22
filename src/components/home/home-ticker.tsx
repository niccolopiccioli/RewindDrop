"use client";

import { useI18n } from "@/components/layout/locale-provider";

export default function HomeTicker() {
  const { t } = useI18n();

  const items = [
    t("home.tickerNewArrivals"),
    t("home.tickerLimitedDrops"),
    t("home.tickerSneakers"),
    t("home.tickerCurated"),
    t("home.tickerMilano"),
    "RewindDrop",
  ];

  const loop = [...items, ...items];

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
