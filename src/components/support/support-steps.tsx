"use client";

import ScrollReveal from "@/components/home/scroll-reveal";

type Step = {
  title: string;
  description: string;
};

export default function SupportSteps({
  title,
  steps,
}: {
  title: string;
  steps: Step[];
}) {
  return (
    <section>
      <ScrollReveal>
        <h2 className="text-display text-xl sm:text-2xl font-semibold mb-8 md:mb-10">
          {title}
        </h2>
      </ScrollReveal>

      <div className="relative">
        <div
          className="hidden md:block absolute left-[1.375rem] top-4 bottom-4 w-px bg-border"
          aria-hidden
        />

        <ol className="space-y-0">
          {steps.map((step, index) => (
            <ScrollReveal key={step.title} delay={index * 90}>
              <li className="relative flex gap-5 md:gap-8 pb-10 last:pb-0">
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-foreground bg-background text-xs font-semibold tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="pt-1.5 min-w-0 flex-1 border-b border-border pb-10 last:border-0">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed max-w-2xl">
                    {step.description}
                  </p>
                </div>
              </li>
            </ScrollReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
