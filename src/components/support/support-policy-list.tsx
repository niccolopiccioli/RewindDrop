"use client";

import { Check } from "lucide-react";
import ScrollReveal from "@/components/home/scroll-reveal";

export default function SupportPolicyList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section>
      <ScrollReveal>
        <h2 className="text-display text-xl sm:text-2xl font-semibold mb-6 md:mb-8">
          {title}
        </h2>
      </ScrollReveal>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {items.map((item, index) => (
          <ScrollReveal key={index} delay={index * 70} direction="scale">
            <li className="flex gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6 h-full">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-white">
                <Check size={14} strokeWidth={2.5} />
              </span>
              <p className="text-sm text-muted leading-relaxed pt-0.5">{item}</p>
            </li>
          </ScrollReveal>
        ))}
      </ul>
    </section>
  );
}
