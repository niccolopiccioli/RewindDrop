import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/api-error";
import {
  HOMEPAGE_CATEGORY_SLUGS,
  HOME_SPOT_KEYS,
  CATEGORY_DEFAULTS,
  SPOT_DEFAULTS,
} from "@/lib/homepage-banner-config";
import { resolveBannerImage } from "@/lib/image-url";

export async function GET() {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  try {
    let categories: Array<{
      id: string;
      slug: string;
      name: string;
      bannerSubtitle: string | null;
      image: string | null;
      imageAlt: string | null;
      objectFit?: string | null;
    }> = [];

    let spots: Array<{
      key: string;
      title: string;
      subtitle: string | null;
      href: string;
      image: string | null;
      imageAlt: string | null;
      objectFit?: string | null;
    }> = [];

    try {
      categories = await prisma.category.findMany({
        where: { slug: { in: [...HOMEPAGE_CATEGORY_SLUGS] } },
        select: {
          id: true,
          slug: true,
          name: true,
          bannerSubtitle: true,
          image: true,
          imageAlt: true,
          objectFit: true,
        },
      });
    } catch (error) {
      console.error("homepage-banners GET categories:", error);
    }

    try {
      spots = await prisma.homeSpot.findMany({
        where: { key: { in: [...HOME_SPOT_KEYS] } },
        select: {
          key: true,
          title: true,
          subtitle: true,
          href: true,
          image: true,
          imageAlt: true,
          objectFit: true,
        },
      });
    } catch (error) {
      console.error("homepage-banners GET spots:", error);
    }

    const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]));
    const spotMap = Object.fromEntries(spots.map((s) => [s.key, s]));

    return NextResponse.json({
      categories: HOMEPAGE_CATEGORY_SLUGS.map((slug) => {
        const row = categoryMap[slug];
        const defaults = CATEGORY_DEFAULTS[slug];
        return {
          id: row?.id ?? null,
          slug,
          name: row?.name ?? defaults.title,
          bannerSubtitle: row?.bannerSubtitle ?? defaults.subtitle,
          image: resolveBannerImage(row?.image, defaults.image),
          imageAlt: row ? (row.imageAlt ?? defaults.imageAlt) : defaults.imageAlt,
          objectFit: row?.objectFit ?? "cover",
          href: `/prodotti?category=${slug}`,
          wide: !!defaults.wide,
        };
      }),
      spots: HOME_SPOT_KEYS.map((key) => {
        const row = spotMap[key];
        const defaults = SPOT_DEFAULTS[key];
        return {
          key,
          title: row?.title ?? defaults.title,
          subtitle: row?.subtitle ?? defaults.subtitle,
          href: row?.href ?? defaults.href,
          image: resolveBannerImage(row?.image, defaults.image),
          imageAlt: row ? (row.imageAlt ?? defaults.imageAlt) : defaults.imageAlt,
          objectFit: row?.objectFit ?? "cover",
        };
      }),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
