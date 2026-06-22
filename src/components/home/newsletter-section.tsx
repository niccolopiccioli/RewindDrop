"use client";

import { useState } from "react";
import Button from "@/components/ui/button";
import ScrollReveal from "@/components/home/scroll-reveal";
import { useI18n } from "@/components/layout/locale-provider";

export default function NewsletterSection() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? "ok" : "error");
    if (res.ok) setEmail("");
  };

  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="container-wide">
        <ScrollReveal direction="scale">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-foreground text-background px-6 py-12 sm:px-10 sm:py-14 md:px-16 md:py-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              aria-hidden
              style={{
                backgroundImage:
                  "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.12), transparent 50%), radial-gradient(circle at 100% 100%, rgba(255,255,255,0.08), transparent 45%)",
              }}
            />

            <div className="relative max-w-xl mx-auto text-center">
              <p className="text-[10px] uppercase tracking-[0.35em] text-background/45 mb-4">
                {t("newsletter.eyebrow")}
              </p>
              <h2 className="text-display text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">
                {t("newsletter.title")}
              </h2>
              <p className="text-sm sm:text-base text-background/55 mb-8 leading-relaxed">
                {t("newsletter.subtitle")}
              </p>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder={t("newsletter.placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3.5 rounded-full border border-background/15 bg-background/5 text-background placeholder:text-background/35 text-sm focus:outline-none focus:ring-2 focus:ring-background/30 transition-shadow"
                />
                <Button
                  type="submit"
                  variant="inverse"
                  shape="pill"
                  className="shrink-0"
                >
                  {t("newsletter.subscribe")}
                </Button>
              </form>

              {status === "ok" && (
                <p className="text-xs text-emerald-300 mt-4 animate-fade-in">
                  {t("newsletter.success")}
                </p>
              )}
              {status === "error" && (
                <p className="text-xs text-red-300 mt-4 animate-fade-in">
                  {t("newsletter.error")}
                </p>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
