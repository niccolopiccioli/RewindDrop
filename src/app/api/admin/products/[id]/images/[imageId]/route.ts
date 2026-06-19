import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { imageUpdateSchema } from "@/lib/validations/product";
import { handleApiError } from "@/lib/api-error";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id, imageId } = await params;

  try {
    const body = await request.json();
    const data = imageUpdateSchema.parse(body);

    const image = await prisma.image.update({
      where: { id: imageId, productId: id },
      data,
    });

    return NextResponse.json(image);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id, imageId } = await params;

  try {
    await prisma.image.delete({
      where: { id: imageId, productId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
