import Link from "next/link";
import MediaImage from "@/components/ui/media-image";
import ScrollReveal from "@/components/home/scroll-reveal";
import type { HomeCarouselProduct } from "@/components/home/product-marquee";

export default function HomeFeaturedDrop({
  hero,
  supporting,
}: {
  hero: HomeCarouselProduct;
  supporting: HomeCarouselProduct[];
}) {
  if (!hero) return null;

  const heroImage = hero.images[0]?.url;
  const heroPrice = Number(hero.price);

  return (
    <section className="py-14 md:py-24 bg-background">
      <div className="container-wide">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-12">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted mb-2">
                Featured drop
              </p>
              <h2 className="text-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                Il pezzo del momento
              </h2>
            </div>
            <Link
              href="/prodotti?sort=newest"
              className="text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors link-hover-slide"
            >
              Vedi tutti →
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          <ScrollReveal className="lg:col-span-7" direction="scale">
            <Link
              href={`/prodotti/${hero.slug}`}
              className="group relative block overflow-hidden bg-surface aspect-[4/5] sm:aspect-[3/4] lg:aspect-auto lg:min-h-[560px] card-hover-lift"
            >
              <MediaImage
                src={heroImage}
                alt={hero.images[0]?.alt || hero.name}
                fill
                fit="cover"
                imageWidth={900}
                loading="eager"
                className="transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <span className="inline-block mb-3 text-[10px] uppercase tracking-[0.3em] text-white/60">
                  Drop highlight
                </span>
                <h3 className="text-display text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-2 max-w-lg leading-tight">
                  {hero.name}
                </h3>
                <p className="text-lg sm:text-xl text-white font-medium">
                  €{heroPrice.toFixed(2)}
                </p>
              </div>
              <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.25em] text-white/70 border border-white/25 rounded-full px-3 py-1 backdrop-blur-sm">
                Nuovo
              </span>
            </Link>
          </ScrollReveal>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 md:gap-6">
            {supporting.map((product, index) => {
              const image = product.images[0]?.url;
              const price = Number(product.price);

              return (
                <ScrollReveal key={product.id} delay={index * 100} direction="left">
                  <Link
                    href={`/prodotti/${product.slug}`}
                    className="group flex gap-4 sm:flex-col lg:flex-row items-stretch overflow-hidden bg-surface card-hover-lift"
                  >
                    <div className="relative w-28 sm:w-full lg:w-36 shrink-0 aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4] overflow-hidden">
                      <MediaImage
                        src={image}
                        alt={product.images[0]?.alt || product.name}
                        fill
                        fit="cover"
                        imageWidth={400}
                        loading="lazy"
                        className="transition-transform duration-700 group-hover:scale-105"
                        sizes="160px"
                      />
                    </div>
                    <div className="flex flex-col justify-center py-3 sm:py-4 pr-4 sm:px-4 lg:pr-5 min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">
                        0{index + 2}
                      </p>
                      <h3 className="text-xs sm:text-sm uppercase tracking-wide line-clamp-2 group-hover:text-muted transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm font-medium mt-2">€{price.toFixed(2)}</p>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
