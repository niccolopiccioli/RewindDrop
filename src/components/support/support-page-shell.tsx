"use client";

import type { LucideIcon } from "lucide-react";
import ScrollReveal from "@/components/home/scroll-reveal";

type SupportPageShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children: React.ReactNode;
};

export default function SupportPageShell({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  children,
}: SupportPageShellProps) {
  return (
    <div className="overflow-x-hidden">
      <header className="relative bg-foreground text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative container-wide py-12 sm:py-14 md:py-16 lg:py-20">
          <ScrollReveal>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 max-w-4xl lg:max-w-none">
              <div className="min-w-0">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl border border-white/15 bg-white/5 mb-6">
                  <Icon size={22} strokeWidth={1.25} className="text-white/70" />
                </div>
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-white/45 mb-3">
                  {eyebrow}
                </p>
                <h1 className="text-display text-[clamp(2rem,7vw,3.5rem)] font-semibold leading-[0.92] tracking-tight">
                  {title}
                </h1>
                <p className="mt-4 text-sm sm:text-base text-white/55 max-w-xl leading-relaxed">
                  {subtitle}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </header>

      <div className="container-wide py-12 md:py-16 lg:py-20 space-y-16 md:space-y-20">
        {children}
      </div>
    </div>
  );
}
