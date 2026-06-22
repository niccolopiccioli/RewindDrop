"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/home/scroll-reveal";

export default function SupportCtaBanner({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <ScrollReveal direction="scale">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-foreground text-white px-6 py-10 sm:px-10 sm:py-12 md:px-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.15), transparent 50%)",
          }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="text-display text-xl sm:text-2xl font-semibold mb-2">{title}</h2>
            <p className="text-sm text-white/55 leading-relaxed">{description}</p>
          </div>
          <Link
            href={href}
            className="inline-flex items-center justify-center gap-2 shrink-0 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-foreground transition-all duration-300"
          >
            {linkLabel}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}
