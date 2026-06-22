"use client";

import { Calendar } from "lucide-react";
import ScrollReveal from "@/components/home/scroll-reveal";

export default function SupportHighlightBanner({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <ScrollReveal direction="scale">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-surface">
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 0% 50%, rgba(29,29,31,0.06), transparent 55%), radial-gradient(circle at 100% 0%, rgba(29,29,31,0.04), transparent 45%)",
          }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 p-8 sm:p-10 md:p-12">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-foreground text-white">
            <Calendar size={28} strokeWidth={1.25} />
          </div>
          <div className="min-w-0">
            <p className="text-display text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              {title}
            </p>
            <p className="text-sm sm:text-base text-muted leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
