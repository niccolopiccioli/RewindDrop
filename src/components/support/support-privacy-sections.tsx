"use client";

import { Cookie, Lock, Mail, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ScrollReveal from "@/components/home/scroll-reveal";

function PrivacyBlock({
  icon: Icon,
  title,
  children,
  id,
  variant = "default",
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  id?: string;
  variant?: "default" | "demo";
}) {
  const isDemo = variant === "demo";

  return (
    <ScrollReveal direction="scale">
      <section
        id={id}
        className={`rounded-2xl sm:rounded-3xl overflow-hidden ${
          isDemo
            ? "border-2 border-foreground bg-foreground text-white"
            : "border border-border bg-background"
        }`}
      >
        <div className={`flex gap-4 sm:gap-5 p-6 sm:p-8 md:p-10 ${isDemo ? "" : "border-b border-border bg-surface/50"}`}>
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isDemo ? "bg-white/10 border border-white/15" : "bg-background border border-border"
            }`}
          >
            <Icon
              size={20}
              strokeWidth={1.25}
              className={isDemo ? "text-white/70" : "text-muted"}
            />
          </div>
          <h2
            className={`text-display text-lg sm:text-xl font-semibold pt-2 ${
              isDemo ? "text-white" : ""
            }`}
          >
            {title}
          </h2>
        </div>
        <div
          className={`px-6 sm:px-8 md:px-10 pb-6 sm:pb-8 md:pb-10 space-y-4 text-sm leading-relaxed ${
            isDemo ? "text-white/60" : "text-muted"
          }`}
        >
          {children}
        </div>
      </section>
    </ScrollReveal>
  );
}

type DataItem = { label: string; description: string };

export default function SupportPrivacySections({
  demoTitle,
  demoBody,
  demoProducts,
  gdprTitle,
  gdprBody,
  collectTitle,
  collectItems,
  rightsTitle,
  rightsBody,
  contactTitle,
  contactBody,
  cookiesTitle,
  cookiesBody,
}: {
  demoTitle: string;
  demoBody: string;
  demoProducts: string;
  gdprTitle: string;
  gdprBody: string;
  collectTitle: string;
  collectItems: DataItem[];
  rightsTitle: string;
  rightsBody: string;
  contactTitle: string;
  contactBody: string;
  cookiesTitle: string;
  cookiesBody: string;
}) {
  return (
    <div className="space-y-6 md:space-y-8">
      <PrivacyBlock id="demo" icon={Shield} title={demoTitle} variant="demo">
        <p>{demoBody}</p>
        <p>{demoProducts}</p>
      </PrivacyBlock>

      <PrivacyBlock icon={Lock} title={gdprTitle}>
        <p>{gdprBody}</p>
      </PrivacyBlock>

      <section>
        <ScrollReveal>
          <h2 className="text-display text-xl sm:text-2xl font-semibold mb-6 md:mb-8">
            {collectTitle}
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {collectItems.map((item, index) => (
            <ScrollReveal key={item.label} delay={index * 60} direction="scale">
              <div className="h-full rounded-2xl border border-border p-5 sm:p-6 bg-surface">
                <p className="text-[10px] uppercase tracking-[0.28em] text-muted mb-2">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-sm font-semibold uppercase tracking-[0.1em] mb-2">
                  {item.label}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{item.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <PrivacyBlock icon={Shield} title={rightsTitle}>
        <p>{rightsBody}</p>
      </PrivacyBlock>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <PrivacyBlock icon={Mail} title={contactTitle}>
          <p>{contactBody}</p>
        </PrivacyBlock>
        <PrivacyBlock icon={Cookie} title={cookiesTitle}>
          <p>{cookiesBody}</p>
        </PrivacyBlock>
      </div>
    </div>
  );
}
