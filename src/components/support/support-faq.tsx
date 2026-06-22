"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ScrollReveal from "@/components/home/scroll-reveal";

type FaqItem = {
  question: string;
  answer: string;
};

export default function SupportFaq({
  title,
  items,
}: {
  title: string;
  items: FaqItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section>
      <ScrollReveal>
        <h2 className="text-display text-xl sm:text-2xl font-semibold mb-6 md:mb-8">
          {title}
        </h2>
      </ScrollReveal>

      <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-background">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <ScrollReveal key={item.question} delay={index * 60}>
              <div>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-5 sm:px-6 text-left hover:bg-surface/80 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium pr-4">{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-muted transition-transform duration-300 mt-0.5 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 sm:px-6 pb-5 text-sm text-muted leading-relaxed max-w-3xl">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
