"use client";

import ProductCard from "@/components/product/product-card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/home/scroll-reveal";

export interface HomeCarouselProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  featured?: boolean;
  images: {
    url: string;
    alt?: string | null;
    objectFit?: string | null;
    colorHex?: string | null;
  }[];
  variants: {
    size?: string | null;
    color?: string | null;
    colorHex?: string | null;
    stock: number;
  }[];
}

export default function ProductMarquee({
  title,
  href,
  products,
  badge,
  reverse = false,
  variant = "light",
}: {
  title: string;
  href: string;
  products: HomeCarouselProduct[];
  badge?: "new" | "sale" | null;
  reverse?: boolean;
  variant?: "light" | "dark";
}) {
  if (products.length === 0) return null;

  const loop = [...products, ...products];
  const duration = Math.max(products.length * 4, 24);
  const isDark = variant === "dark";

  return (
    <section
      className={`py-12 md:py-20 overflow-hidden content-auto ${
        isDark ? "bg-foreground text-background" : "bg-background"
      }`}
    >
      <div className="container-wide mb-6 md:mb-10">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p
                className={`text-[10px] uppercase tracking-[0.35em] mb-2 ${
                  isDark ? "text-background/45" : "text-muted"
                }`}
              >
                In movimento
              </p>
              <h2 className="text-display text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">
                {title}
              </h2>
            </div>
            <Link
              href={href}
              className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] transition-colors link-hover-slide ${
                isDark
                  ? "text-background/55 hover:text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Vedi tutti
              <ArrowRight size={14} />
            </Link>
          </div>
        </ScrollReveal>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 -mx-0 pb-1 scrollbar-none">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[72vw] max-w-[280px] shrink-0 snap-start"
            >
              <ProductCard product={product} badge={badge} cycleColors />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop marquee */}
      <div className="hidden md:block relative">
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-16 lg:w-24 bg-gradient-to-r ${
            isDark ? "from-foreground" : "from-background"
          } to-transparent`}
        />
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-16 lg:w-24 bg-gradient-to-l ${
            isDark ? "from-foreground" : "from-background"
          } to-transparent`}
        />

        <div className="overflow-hidden">
          <div
            className={`flex w-max gap-6 lg:gap-8 hover:[animation-play-state:paused] motion-reduce:animate-none ${
              reverse ? "animate-home-marquee-reverse" : "animate-home-marquee"
            }`}
            style={{ animationDuration: `${duration}s` }}
          >
            {loop.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className="w-[260px] lg:w-[280px] shrink-0"
              >
                <ProductCard product={product} badge={badge} cycleColors />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
