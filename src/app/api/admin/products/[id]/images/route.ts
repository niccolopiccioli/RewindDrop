import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { imageSchema } from "@/lib/validations/product";
import { handleApiError } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const body = await request.json();
    const data = imageSchema.parse(body);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
    }

    const maxPosition = await prisma.image.aggregate({
      where: { productId: id },
      _max: { position: true },
    });

    const image = await prisma.image.create({
      data: {
        productId: id,
        url: data.url,
        alt: data.alt ?? null,
        objectFit: data.objectFit ?? "cover",
        position: data.position ?? (maxPosition._max.position ?? -1) + 1,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
