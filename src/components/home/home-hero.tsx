"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import MediaImage from "@/components/ui/media-image";
import Button from "@/components/ui/button";
import { HERO_IMAGE } from "@/lib/mock-images";
import { useI18n } from "@/components/layout/locale-provider";
import { usePaths } from "@/hooks/use-paths";

export default function HomeHero() {
  const { t } = useI18n();
  const paths = usePaths();

  return (
    <section className="relative overflow-hidden bg-foreground min-h-[min(92vh,900px)]">
      {/* Full-bleed hero image — sits under transparent navbar */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 animate-hero-image-in motion-reduce:animate-none">
          <div className="absolute -inset-[3%] animate-hero-ken-burns motion-reduce:animate-none">
            <MediaImage
              src={HERO_IMAGE}
              alt="Streetwear"
              fill
              fit="cover"
              priority
              imageWidth={1400}
              className="object-[center_72%] lg:object-[58%_24%]"
              placeholderClassName="bg-foreground"
              iconClassName="w-16 h-16 text-white/20"
              sizes="100vw"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-foreground/20 lg:bg-gradient-to-r lg:from-foreground lg:via-foreground/75 lg:to-foreground/15" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-[min(92vh,900px)]">
        <div className="flex flex-col justify-end lg:justify-center order-2 lg:order-1">
          <div className="container-wide lg:max-w-none py-10 sm:py-12 lg:py-16 pt-16 lg:pt-[5.25rem] scroll-mt-16 lg:scroll-mt-[5.25rem]">
            <div className="max-w-xl pl-7 sm:pl-10 md:pl-12 lg:pl-[clamp(1.75rem,5vw,4.5rem)] xl:pl-[clamp(2.5rem,7vw,6rem)]">
              <p className="hero-reveal hero-reveal-d1 text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-white/55 mb-4 sm:mb-5">
                {t("hero.eyebrow")}
              </p>

              <h1 className="hero-reveal hero-reveal-d2 text-display text-[clamp(2.5rem,9vw,5.5rem)] font-semibold text-white leading-[0.92] tracking-tight mb-4 sm:mb-6">
                {t("hero.title1")}
                <span className="block text-white/90">{t("hero.title2")}</span>
              </h1>

              <p className="hero-reveal hero-reveal-d3 text-sm sm:text-base text-white/60 mb-8 max-w-md leading-relaxed">
                {t("hero.subtitle")}
              </p>

              <div className="hero-reveal hero-reveal-d4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href={paths.products}>
                  <Button
                    variant="inverse"
                    shape="pill"
                    size="lg"
                    className="w-full sm:w-auto group"
                  >
                    {t("hero.ctaShop")}
                    <ArrowRight
                      size={16}
                      className="ml-2 transition-transform group-hover:translate-x-1"
                    />
                  </Button>
                </Link>
                <Link href={paths.productsCategory("sneakers")}>
                  <Button
                    variant="outline-inverse"
                    shape="pill"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {t("hero.ctaSneakers")}
                    <ArrowUpRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>

              <dl className="hero-reveal hero-reveal-d5 mt-10 sm:mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                {[
                  { label: t("hero.statPieces"), value: "50+" },
                  { label: t("hero.statBrands"), value: "Heat" },
                  { label: t("hero.statDrop"), value: "24/7" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
                      {stat.label}
                    </dt>
                    <dd className="text-lg sm:text-xl font-medium text-white tabular-nums">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="relative order-1 lg:order-2 h-[min(40dvh,360px)] sm:h-[min(44dvh,400px)] lg:h-auto lg:min-h-0" aria-hidden>
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 hero-reveal hero-reveal-d5 hidden sm:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              {t("hero.liveDrop")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
