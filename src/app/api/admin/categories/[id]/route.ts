import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth-guards";
import { categoryUpdateSchema } from "@/lib/validations/category";
import { handleApiError } from "@/lib/api-error";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const body = await request.json();
    const data = categoryUpdateSchema.parse(body);

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...data,
        description: data.description === "" ? null : data.description,
        image: data.image === "" ? null : data.image,
        parentId: data.parentId === "" ? null : data.parentId,
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: `Impossibile eliminare: ${productCount} prodotti associati` },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
