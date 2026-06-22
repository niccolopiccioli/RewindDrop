import dynamic from "next/dynamic";
import HomeHero from "@/components/home/home-hero";
import HomeTicker from "@/components/home/home-ticker";
import HomeFeaturedDrop from "@/components/home/home-featured-drop";
import HomeCategoryRail from "@/components/home/home-category-rail";
import HomeEditorialMosaic from "@/components/home/home-editorial-mosaic";
import HomeManifesto from "@/components/home/home-manifesto";
import { getHomepageBanners } from "@/lib/homepage-banners";
import { listStoreCategories } from "@/lib/categories-query";
import { getHomepageProducts } from "@/lib/products-query";
import { getPaths } from "@/lib/paths";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

const ProductCarouselSection = dynamic(
  () => import("@/components/home/product-carousel-section"),
  { loading: () => <div className="py-16 md:py-20" aria-hidden /> }
);

const NewsletterSection = dynamic(
  () => import("@/components/home/newsletter-section"),
  { loading: () => <div className="py-16 md:py-24" aria-hidden /> }
);

export const revalidate = 120;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const paths = getPaths(locale as Locale);
  const loc = locale as Locale;

  const [{ editorialSplit, lookbookWide, lookbookGrid }, productSets, categories] =
    await Promise.all([
      getHomepageBanners(),
      getHomepageProducts(),
      listStoreCategories(),
    ]);

  const { newest, bestSellers, dropHero, dropSupporting } = productSets;

  return (
    <div className="overflow-x-hidden">
      <HomeHero />
      <HomeTicker />

      {dropHero && (
        <HomeFeaturedDrop hero={dropHero} supporting={dropSupporting} />
      )}

      <HomeCategoryRail categories={categories} />

      <ProductCarouselSection
        title={t(loc, "nav.newArrivals")}
        href={paths.productsNewest}
        products={newest}
        badge="new"
      />

      <HomeEditorialMosaic
        editorialSplit={editorialSplit}
        lookbookWide={lookbookWide}
        lookbookGrid={lookbookGrid}
      />

      <HomeManifesto />

      <ProductCarouselSection
        title={t(loc, "home.bestSellers")}
        href={paths.products}
        products={bestSellers}
        reverse
        variant="dark"
      />

      <NewsletterSection />
    </div>
  );
}
