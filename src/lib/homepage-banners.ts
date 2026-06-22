import { prisma } from "@/lib/prisma";
import {
  HOMEPAGE_CATEGORY_SLUGS,
  HOME_SPOT_KEYS,
  CATEGORY_DEFAULTS,
  SPOT_DEFAULTS,
  type HomepageCategorySlug,
  type HomeSpotKey,
} from "@/lib/homepage-banner-config";
import { normalizeImageFit, type ImageFit } from "@/lib/image-fit";
import { resolveBannerImage } from "@/lib/image-url";

export {
  HOMEPAGE_CATEGORY_SLUGS,
  HOME_SPOT_KEYS,
  CATEGORY_DEFAULTS,
  SPOT_DEFAULTS,
  type HomepageCategorySlug,
  type HomeSpotKey,
} from "@/lib/homepage-banner-config";

export type HomepageBanner = {
  title: string;
  subtitle?: string;
  href: string;
  image: string | null;
  imageAlt: string;
  objectFit: ImageFit;
  wide?: boolean;
};

function categoryBanner(
  slug: HomepageCategorySlug,
  row?: {
    name: string;
    bannerSubtitle: string | null;
    image: string | null;
    imageAlt: string | null;
    objectFit?: string | null;
  } | null
): HomepageBanner {
  const defaults = CATEGORY_DEFAULTS[slug];
  return {
    title: row?.name ?? defaults.title,
    subtitle: row?.bannerSubtitle ?? defaults.subtitle,
    href: `/products?category=${slug}`,
    image: resolveBannerImage(row?.image, defaults.image),
    imageAlt: row ? (row.imageAlt ?? defaults.imageAlt) : defaults.imageAlt,
    objectFit: normalizeImageFit(row?.objectFit),
    wide: defaults.wide,
  };
}

function spotBanner(
  key: HomeSpotKey,
  row?: {
    title: string;
    subtitle: string | null;
    href: string;
    image: string | null;
    imageAlt: string | null;
    objectFit?: string | null;
  } | null
): HomepageBanner {
  const defaults = SPOT_DEFAULTS[key];
  return {
    title: row?.title ?? defaults.title,
    subtitle: row?.subtitle ?? defaults.subtitle,
    href: row?.href ?? defaults.href,
    image: resolveBannerImage(row?.image, defaults.image),
    imageAlt: row ? (row.imageAlt ?? defaults.imageAlt) : defaults.imageAlt,
    objectFit: normalizeImageFit(row?.objectFit),
  };
}

export async function getHomepageBanners() {
  let categories: Array<{
    slug: string;
    name: string;
    bannerSubtitle: string | null;
    image: string | null;
    imageAlt: string | null;
  }> = [];
  let spots: Array<{
    key: string;
    title: string;
    subtitle: string | null;
    href: string;
    image: string | null;
    imageAlt: string | null;
  }> = [];

  try {
    categories = await prisma.category.findMany({
      where: { slug: { in: [...HOMEPAGE_CATEGORY_SLUGS] } },
      select: {
        slug: true,
        name: true,
        bannerSubtitle: true,
        image: true,
        imageAlt: true,
        objectFit: true,
      },
    });
  } catch (error) {
    console.error("Homepage banners: categories fetch failed", error);
  }

  try {
    spots = await prisma.homeSpot.findMany({
      where: { key: { in: [...HOME_SPOT_KEYS] } },
    });
  } catch (error) {
    console.error("Homepage banners: home spots fetch failed", error);
  }

  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]));
  const spotMap = Object.fromEntries(spots.map((s) => [s.key, s]));

  return {
    editorialSplit: [
      categoryBanner("felpe", categoryMap.felpe),
      categoryBanner("t-shirts", categoryMap["t-shirts"]),
    ],
    lookbookWide: categoryBanner("giacche", categoryMap.giacche),
    lookbookGrid: [
      spotBanner("lookbook", spotMap.lookbook),
      spotBanner("details", spotMap.details),
    ],
  };
}
