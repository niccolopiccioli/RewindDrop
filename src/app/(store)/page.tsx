import Link from "next/link";
import { Suspense } from "react";
import MediaImage from "@/components/ui/media-image";
import { Truck, Shield, RotateCcw } from "lucide-react";
import CategoryPills from "@/components/ui/category-pills";
import EditorialBanner from "@/components/ui/editorial-banner";
import ProductGridSection from "@/components/home/product-grid-section";
import NewsletterSection from "@/components/home/newsletter-section";
import Button from "@/components/ui/button";
import { EDITORIAL_IMAGES, HERO_IMAGE } from "@/lib/mock-images";

const features = [
  { icon: Truck, title: "Spedizione gratuita", desc: "Ordini sopra i 50€" },
  { icon: Shield, title: "Pagamento sicuro", desc: "SSL crittografato" },
  { icon: RotateCcw, title: "Resi facili", desc: "30 giorni" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden -mt-16 bg-foreground">
        <MediaImage
          src={HERO_IMAGE}
          alt="Streetwear essenziale"
          fill
          placeholderClassName="bg-foreground"
          iconClassName="w-16 h-16 text-white/25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 container-wide">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/70 mb-4">
            Nuova Collezione
          </p>
          <h1 className="text-display text-4xl md:text-6xl lg:text-7xl font-semibold text-white mb-6 max-w-xl leading-[1.1]">
            Streetwear
            <br />
            Essenziale
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/prodotti">
              <Button
                shape="pill"
                size="lg"
                variant="secondary"
                className="bg-white text-black hover:bg-white/90"
              >
                Scopri la collezione
              </Button>
            </Link>
            <Link href="/prodotti?sort=newest">
              <Button
                shape="pill"
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-foreground"
              >
                Nuovi arrivi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section className="py-8 md:py-10 border-b border-border">
        <div className="container-wide">
          <Suspense fallback={<div className="h-10" />}>
            <CategoryPills />
          </Suspense>
        </div>
      </section>

      {/* New arrivals */}
      <ProductGridSection
        title="Nuovi Arrivi"
        href="/prodotti?sort=newest"
        params={{ sort: "newest" }}
        badge="new"
      />

      {/* Editorial split */}
      <section className="py-8 md:py-12">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <EditorialBanner title="Felpe" subtitle="Comfort e stile" href="/prodotti?category=felpe" image={EDITORIAL_IMAGES.felpe} imageAlt="Felpe" />
            <EditorialBanner title="T-Shirts" subtitle="Essenziali" href="/prodotti?category=t-shirts" image={EDITORIAL_IMAGES.tShirts} imageAlt="T-Shirts" />
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <ProductGridSection
        title="Best Seller"
        href="/prodotti"
        params={{ sort: "newest", limit: "8" }}
      />

      {/* Lookbook */}
      <section className="py-8 md:py-12">
        <div className="container-wide space-y-4 md:space-y-6">
          <EditorialBanner
            title="Giacche"
            subtitle="Outerwear"
            href="/prodotti?category=giacche"
            image={EDITORIAL_IMAGES.giacche}
            imageAlt="Giacche"
            className="aspect-[16/7] md:aspect-[21/9]"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <EditorialBanner title="Lookbook" subtitle="Milano" href="/prodotti" image={EDITORIAL_IMAGES.lookbook} imageAlt="Lookbook Milano" />
            <EditorialBanner title="Dettagli" subtitle="Texture & materiali" href="/prodotti" image={EDITORIAL_IMAGES.details} imageAlt="Dettagli streetwear" />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-12 md:py-16 bg-surface border-y border-border">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <f.icon size={20} strokeWidth={1.5} className="text-muted mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium mb-1">{f.title}</h3>
                  <p className="text-xs text-muted">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
}
