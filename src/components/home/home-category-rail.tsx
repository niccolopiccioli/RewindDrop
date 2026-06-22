import Link from "next/link";
import MediaImage from "@/components/ui/media-image";
import ScrollReveal from "@/components/home/scroll-reveal";

type CategoryRailItem = {
  name: string;
  slug: string;
  image?: string | null;
  imageAlt?: string | null;
};

const HIGHLIGHT_SLUGS = [
  "sneakers",
  "felpe",
  "t-shirts",
  "giacche",
  "pantaloni",
  "cappelli",
];

export default function HomeCategoryRail({
  categories,
}: {
  categories: CategoryRailItem[];
}) {
  const ordered = HIGHLIGHT_SLUGS.map((slug) =>
    categories.find((category) => category.slug === slug)
  ).filter(Boolean) as CategoryRailItem[];

  if (ordered.length === 0) return null;

  return (
    <section className="py-12 md:py-16 border-b border-border bg-surface/50">
      <div className="container-wide mb-6 md:mb-8">
        <ScrollReveal>
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted mb-2">
            Esplora
          </p>
          <h2 className="text-display text-xl sm:text-2xl font-semibold">
            Scegli la tua categoria
          </h2>
        </ScrollReveal>
      </div>

      <div className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-8 pb-2 scrollbar-none">
        {ordered.map((category, index) => (
          <ScrollReveal
            key={category.slug}
            delay={index * 70}
            direction="scale"
            className="snap-start shrink-0"
          >
            <Link
              href={`/prodotti?category=${category.slug}`}
              className="group relative block w-[68vw] sm:w-[280px] md:w-[300px] aspect-[3/4] overflow-hidden bg-foreground card-hover-lift"
            >
              <MediaImage
                src={category.image}
                alt={category.imageAlt || category.name}
                fill
                fit="cover"
                imageWidth={600}
                loading="lazy"
                className="opacity-80 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
                sizes="300px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <span className="block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-2 transition-transform duration-500 group-hover:-translate-y-0.5">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-display text-lg sm:text-xl font-semibold text-white">
                  {category.name}
                </h3>
              </div>
              <span className="absolute top-4 right-4 h-8 w-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                →
              </span>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
