import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/api-error";
import { homeSpotBannerSchema } from "@/lib/validations/homepage-banner";
import { HOME_SPOT_KEYS, SPOT_DEFAULTS, type HomeSpotKey } from "@/lib/homepage-banners";
import { normalizeImageUrl } from "@/lib/image-url";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { key } = await params;

  if (!HOME_SPOT_KEYS.includes(key as HomeSpotKey)) {
    return NextResponse.json({ error: "Banner non valido" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = homeSpotBannerSchema.parse(body);
    const defaults = SPOT_DEFAULTS[key as HomeSpotKey];

    const normalizedImage =
      data.image === "" || data.image === null
        ? null
        : normalizeImageUrl(data.image ?? defaults.image);

    const spot = await prisma.homeSpot.upsert({
      where: { key },
      create: {
        key,
        title: data.title,
        subtitle: data.subtitle === "" ? null : data.subtitle,
        href: data.href,
        image: normalizedImage ?? defaults.image,
        imageAlt:
          data.imageAlt === "" || data.imageAlt === null
            ? null
            : data.imageAlt ?? defaults.imageAlt,
        objectFit: data.objectFit ?? "cover",
      },
      update: {
        title: data.title,
        subtitle: data.subtitle === "" ? null : data.subtitle,
        href: data.href,
        image: normalizedImage,
        imageAlt:
          data.imageAlt === "" || data.imageAlt === null
            ? null
            : data.imageAlt,
        objectFit: data.objectFit ?? undefined,
      },
    });

    return NextResponse.json(spot);
  } catch (error) {
    return handleApiError(error);
  }
}
