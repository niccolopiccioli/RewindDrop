import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/api-error";
import { homepageCategoryBannerSchema } from "@/lib/validations/homepage-banner";
import {
  HOMEPAGE_CATEGORY_SLUGS,
  type HomepageCategorySlug,
} from "@/lib/homepage-banners";
import { normalizeImageUrl } from "@/lib/image-url";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { slug } = await params;

  if (!HOMEPAGE_CATEGORY_SLUGS.includes(slug as HomepageCategorySlug)) {
    return NextResponse.json({ error: "Banner non valido" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = homepageCategoryBannerSchema.parse(body);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json(
        { error: `Categoria "${slug}" non trovata. Esegui npm run db:seed.` },
        { status: 404 }
      );
    }

    const category = await prisma.category.update({
      where: { slug },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        bannerSubtitle:
          data.bannerSubtitle === "" ? null : data.bannerSubtitle,
        image:
          data.image === "" || data.image === null || data.image === undefined
            ? null
            : normalizeImageUrl(data.image),
        imageAlt:
          data.imageAlt === "" || data.imageAlt === null
            ? null
            : data.imageAlt,
        objectFit: data.objectFit ?? undefined,
      },
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

    return NextResponse.json({
      ...category,
      href: `/products?category=${category.slug}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
