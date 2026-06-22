"use client";

import Link from "next/link";
import { ArrowRight, Package, RotateCcw, Shield } from "lucide-react";
import ScrollReveal from "@/components/home/scroll-reveal";
import { usePaths } from "@/hooks/use-paths";
import { useI18n } from "@/components/layout/locale-provider";

type SupportPage = "shipping" | "returns" | "privacy";

const ICONS = {
  shipping: Package,
  returns: RotateCcw,
  privacy: Shield,
} as const;

export default function SupportCrossLinks({ current }: { current: SupportPage }) {
  const paths = usePaths();
  const { t } = useI18n();

  const links: { id: SupportPage; href: string; title: string; desc: string }[] = [
    {
      id: "shipping",
      href: paths.shipping,
      title: t("footer.shipping"),
      desc: t("support.crosslinks.shipping"),
    },
    {
      id: "returns",
      href: paths.returns,
      title: t("footer.returns"),
      desc: t("support.crosslinks.returns"),
    },
    {
      id: "privacy",
      href: paths.privacy,
      title: t("footer.privacy"),
      desc: t("support.crosslinks.privacy"),
    },
  ];

  return (
    <section>
      <ScrollReveal>
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted mb-6">
          {t("support.crosslinks.eyebrow")}
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {links.map((link, index) => {
          const Icon = ICONS[link.id];
          const active = link.id === current;

          return (
            <ScrollReveal key={link.id} delay={index * 80} direction="scale">
              {active ? (
                <div className="h-full rounded-2xl border-2 border-foreground bg-foreground text-white p-6 md:p-7">
                  <Icon size={20} strokeWidth={1.25} className="text-white/60 mb-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] mb-2">
                    {link.title}
                  </h3>
                  <p className="text-sm text-white/55 leading-relaxed">{link.desc}</p>
                  <span className="inline-block mt-4 text-[10px] uppercase tracking-[0.25em] text-white/40">
                    {t("support.crosslinks.current")}
                  </span>
                </div>
              ) : (
                <Link
                  href={link.href}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 md:p-7 transition-all duration-300 hover:border-foreground hover:bg-background card-hover-lift"
                >
                  <Icon
                    size={20}
                    strokeWidth={1.25}
                    className="text-muted mb-4 transition-colors group-hover:text-foreground"
                  />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] mb-2">
                    {link.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed flex-1">{link.desc}</p>
                  <span className="inline-flex items-center gap-1.5 mt-4 text-[10px] uppercase tracking-[0.25em] text-muted group-hover:text-foreground transition-colors">
                    {t("support.crosslinks.explore")}
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              )}
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
