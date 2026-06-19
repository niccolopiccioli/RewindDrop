import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { imageReorderSchema } from "@/lib/validations/product";
import { handleApiError } from "@/lib/api-error";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const body = await request.json();
    const { order } = imageReorderSchema.parse(body);

    await prisma.$transaction(
      order.map((item) =>
        prisma.image.update({
          where: { id: item.id, productId: id },
          data: { position: item.position },
        })
      )
    );

    const images = await prisma.image.findMany({
      where: { productId: id },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({ images });
  } catch (error) {
    return handleApiError(error);
  }
}
