import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import MediaImage from "@/components/ui/media-image";
import Button from "@/components/ui/button";
import { HERO_IMAGE } from "@/lib/mock-images";

export default function HomeHero() {
  return (
    <section className="relative bg-foreground overflow-hidden">
      <div className="lg:grid lg:grid-cols-2 lg:min-h-[min(92vh,900px)]">
        {/* Copy */}
        <div className="relative z-10 flex flex-col justify-end lg:justify-center order-2 lg:order-1">
          <div className="container-wide lg:max-w-none lg:pl-8 xl:pl-12 py-10 sm:py-12 lg:py-16 pt-6 sm:pt-8 lg:pt-16">
            <div className="max-w-xl">
              <p className="hero-reveal hero-reveal-d1 text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-white/55 mb-4 sm:mb-5">
                Nuova Collezione — SS26
              </p>

              <h1 className="hero-reveal hero-reveal-d2 text-display text-[clamp(2.5rem,9vw,5.5rem)] font-semibold text-white leading-[0.92] tracking-tight mb-4 sm:mb-6">
                Streetwear
                <span className="block text-white/90">Essenziale</span>
              </h1>

              <p className="hero-reveal hero-reveal-d3 text-sm sm:text-base text-white/60 mb-8 max-w-md leading-relaxed">
                Drop curati, silhouette pulite, sneakers heat. Il tuo guardaroba
                urbano, senza rumore.
              </p>

              <div className="hero-reveal hero-reveal-d4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/prodotti">
                  <Button
                    variant="inverse"
                    shape="pill"
                    size="lg"
                    className="w-full sm:w-auto group"
                  >
                    Scopri il drop
                    <ArrowRight
                      size={16}
                      className="ml-2 transition-transform group-hover:translate-x-1"
                    />
                  </Button>
                </Link>
                <Link href="/prodotti?category=sneakers">
                  <Button
                    variant="outline-inverse"
                    shape="pill"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Sneakers
                    <ArrowUpRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>

              <dl className="hero-reveal hero-reveal-d5 mt-10 sm:mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                {[
                  { label: "Pezzi", value: "50+" },
                  { label: "Brand", value: "Heat" },
                  { label: "Drop", value: "24/7" },
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

        {/* Visual */}
        <div className="relative order-1 lg:order-2 h-[52vh] sm:h-[58vh] lg:h-auto min-h-[320px]">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 animate-hero-ken-burns motion-reduce:animate-none">
              <MediaImage
                src={HERO_IMAGE}
                alt="Streetwear essenziale"
                fill
                fit="cover"
                priority
                imageWidth={1400}
                className="object-[center_35%] lg:object-center"
                placeholderClassName="bg-foreground"
                iconClassName="w-16 h-16 text-white/20"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/20 to-transparent lg:bg-gradient-to-l lg:from-foreground lg:via-transparent lg:to-transparent" />

          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 hero-reveal hero-reveal-d5 hidden sm:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 backdrop-blur-md px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              Live drop
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
