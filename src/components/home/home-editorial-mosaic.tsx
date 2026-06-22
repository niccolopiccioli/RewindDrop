"use client";

import Link from "next/link";
import MediaImage from "@/components/ui/media-image";
import { normalizeImageFit } from "@/lib/image-fit";
import type { HomepageBanner } from "@/lib/homepage-banners";
import ScrollReveal from "@/components/home/scroll-reveal";
import { useI18n } from "@/components/layout/locale-provider";

export default function HomeEditorialMosaic({
  editorialSplit,
  lookbookWide,
  lookbookGrid,
}: {
  editorialSplit: HomepageBanner[];
  lookbookWide: HomepageBanner;
  lookbookGrid: HomepageBanner[];
}) {
  const { t } = useI18n();
  const [left, right] = editorialSplit;
  const [spotLeft, spotRight] = lookbookGrid;

  return (
    <section className="py-14 md:py-24">
      <div className="container-wide">
        <ScrollReveal className="mb-8 md:mb-12">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted mb-2">
            {t("home.editorialEyebrow")}
          </p>
          <h2 className="text-display text-2xl sm:text-3xl font-semibold">
            {t("home.editorialTitle")}
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:gap-5 auto-rows-[200px] sm:auto-rows-[220px] md:auto-rows-[240px]">
          {left && (
            <ScrollReveal className="md:col-span-5 md:row-span-2" direction="scale">
              <MosaicTile banner={left} className="h-full min-h-[280px] md:min-h-0" />
            </ScrollReveal>
          )}
          {right && (
            <ScrollReveal className="md:col-span-7 md:row-span-2" delay={80} direction="scale">
              <MosaicTile banner={right} className="h-full min-h-[280px] md:min-h-0" />
            </ScrollReveal>
          )}
          <ScrollReveal className="md:col-span-12 md:row-span-2" delay={120}>
            <MosaicTile
              banner={lookbookWide}
              className="h-full min-h-[220px] md:min-h-[320px]"
              wide
            />
          </ScrollReveal>
          {spotLeft && (
            <ScrollReveal className="md:col-span-6 md:row-span-2" delay={160} direction="left">
              <MosaicTile banner={spotLeft} className="h-full min-h-[260px] md:min-h-0" />
            </ScrollReveal>
          )}
          {spotRight && (
            <ScrollReveal className="md:col-span-6 md:row-span-2" delay={200} direction="right">
              <MosaicTile banner={spotRight} className="h-full min-h-[260px] md:min-h-0" />
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
}

function MosaicTile({
  banner,
  className = "",
  wide = false,
}: {
  banner: HomepageBanner;
  className?: string;
  wide?: boolean;
}) {
  return (
    <Link
      href={banner.href}
      className={`group relative block overflow-hidden bg-surface card-hover-lift ${className}`}
    >
      <MediaImage
        src={banner.image}
        alt={banner.imageAlt}
        fill
        fit={normalizeImageFit(banner.objectFit)}
        imageWidth={wide ? 1200 : 800}
        loading="lazy"
        className="transition-transform duration-[1.1s] ease-out group-hover:scale-[1.05]"
        sizes={wide ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 md:p-8 translate-y-1 transition-transform duration-500 group-hover:translate-y-0">
        {banner.subtitle && (
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-white/60 mb-2">
            {banner.subtitle}
          </p>
        )}
        <h3
          className={`text-display font-semibold text-white leading-tight ${
            wide ? "text-2xl sm:text-3xl md:text-4xl" : "text-lg sm:text-xl md:text-2xl"
          }`}
        >
          {banner.title}
        </h3>
      </div>
    </Link>
  );
}
