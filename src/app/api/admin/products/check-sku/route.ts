import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const sku = request.nextUrl.searchParams.get("sku")?.trim();
  const excludeProductId =
    request.nextUrl.searchParams.get("excludeProductId") ?? undefined;

  if (!sku) {
    return NextResponse.json({ available: false, error: "SKU richiesto" }, { status: 400 });
  }

  try {
    const [productMatch, variantMatch] = await Promise.all([
      prisma.product.findFirst({
        where: {
          sku: { equals: sku, mode: "insensitive" },
          ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
        },
        select: { id: true, name: true },
      }),
      prisma.variant.findFirst({
        where: {
          sku: { equals: sku, mode: "insensitive" },
          ...(excludeProductId ? { productId: { not: excludeProductId } } : {}),
        },
        select: { id: true, productId: true, name: true },
      }),
    ]);

    const conflict = productMatch ?? variantMatch;

    return NextResponse.json({
      available: !conflict,
      conflict: conflict
        ? {
            type: productMatch ? "product" : "variant",
            id: conflict.id,
            name: productMatch?.name ?? variantMatch?.name,
          }
        : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
