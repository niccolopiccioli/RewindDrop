"use client";

import ScrollReveal from "@/components/home/scroll-reveal";

type Stat = {
  label: string;
  value: string;
  hint?: string;
};

export default function SupportStatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
      {stats.map((stat, index) => (
        <ScrollReveal key={stat.label} delay={index * 80} direction="scale">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 md:p-7 h-full">
            <div
              className="absolute top-0 right-0 text-[4rem] font-semibold leading-none text-foreground/[0.04] select-none pointer-events-none tabular-nums"
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-2">
              {stat.label}
            </p>
            <p className="text-display text-2xl sm:text-3xl font-semibold tracking-tight">
              {stat.value}
            </p>
            {stat.hint && (
              <p className="mt-2 text-xs text-muted leading-relaxed">{stat.hint}</p>
            )}
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
