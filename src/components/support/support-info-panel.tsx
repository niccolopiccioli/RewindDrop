"use client";

import { MapPin } from "lucide-react";
import ScrollReveal from "@/components/home/scroll-reveal";

export default function SupportInfoPanel({
  title,
  description,
  note,
}: {
  title: string;
  description: string;
  note?: string;
}) {
  return (
    <ScrollReveal>
      <div className="rounded-2xl border border-dashed border-border bg-background p-6 sm:p-8 md:p-10">
        <div className="flex gap-4 sm:gap-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface border border-border">
            <MapPin size={18} strokeWidth={1.5} className="text-muted" />
          </div>
          <div className="min-w-0">
            <h2 className="text-display text-lg sm:text-xl font-semibold mb-3">{title}</h2>
            <p className="text-sm text-muted leading-relaxed max-w-3xl">{description}</p>
            {note && (
              <p className="mt-4 text-xs text-muted/80 leading-relaxed border-l-2 border-border pl-4 max-w-3xl">
                {note}
              </p>
            )}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}
